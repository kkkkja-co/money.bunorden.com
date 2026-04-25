'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { deriveKey, encrypt, decrypt, generateSalt } from '@/lib/encryption'
import { useTranslation } from '@/app/providers'
import { Shield, Lock, Unlock, Key } from 'lucide-react'

interface VaultContextType {
  vaultKey: CryptoKey | null
  isLocked: boolean
  setupVault: (password: string) => Promise<void>
  unlockVault: (password: string) => Promise<void>
  encryptData: (text: string) => Promise<string>
  decryptData: (encrypted: string) => Promise<string>
}

const VaultContext = createContext<VaultContextType | undefined>(undefined)

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null)
  const [isLocked, setIsLocked] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 1. Fetch user profile and encryption metadata
  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, encryption_salt, encryption_check')
      .eq('id', user.id)
      .single()

    setUserProfile(profile)

    // Check if we have a password cached from login (Option B)
    const cachedPassword = sessionStorage.getItem('clavi_vault_pass')
    if (cachedPassword && profile?.encryption_salt) {
      try {
        await unlockVault(cachedPassword)
        sessionStorage.removeItem('clavi_vault_pass') // Clear for security
      } catch (err) {
        console.error('Auto-unlock failed:', err)
      }
    } else if (!profile?.encryption_salt) {
      // First time user (Social or Email without salt)
      setShowPinSetup(true)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // 2. Setup Vault (Generate Salt and Verification String)
  const setupVault = async (password: string) => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const salt = generateSalt()
      const key = await deriveKey(password, salt)
      
      // Create a verification string: encrypt "clavi_ok" with the key
      const check = await encrypt('clavi_ok', key)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          encryption_salt: salt,
          encryption_check: check
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setVaultKey(key)
      setIsLocked(false)
      setShowPinSetup(false)
    } catch (err: any) {
      setError(err.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  // 3. Unlock Vault
  const unlockVault = async (password: string) => {
    setLoading(true)
    setError('')
    try {
      if (!userProfile?.encryption_salt) throw new Error('Vault not set up')

      const key = await deriveKey(password, userProfile.encryption_salt)
      
      // Verify key
      const decryptedCheck = await decrypt(userProfile.encryption_check, key)
      if (decryptedCheck !== 'clavi_ok') {
        throw new Error('Incorrect password or PIN')
      }

      setVaultKey(key)
      setIsLocked(false)
    } catch (err: any) {
      setError(err.message || 'Unlock failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const encryptData = async (text: string) => {
    if (!vaultKey || !text) return text
    return await encrypt(text, vaultKey)
  }

  const decryptData = async (encrypted: string) => {
    if (!vaultKey || !encrypted) return encrypted
    
    // Safety check: Only attempt decryption if it looks like Base64 ciphertext
    // (Ciphertext usually has a certain length and character set)
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(encrypted)
    if (!isBase64 || encrypted.length < 16) return encrypted

    try {
      return await decrypt(encrypted, vaultKey)
    } catch (err) {
      // If decryption fails, it's likely plain text or from a different key.
      // We return the original so the app doesn't crash.
      return encrypted
    }
  }

  if (loading && !vaultKey) return null

  return (
    <VaultContext.Provider value={{ vaultKey, isLocked, setupVault, unlockVault, encryptData, decryptData }}>
      {children}

      {/* Vault Setup/Unlock Modal for Social Users */}
      {(showPinSetup || (isLocked && userProfile?.encryption_salt && !sessionStorage.getItem('clavi_vault_pass'))) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in px-4">
          <div className="surface-elevated w-full max-w-sm p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
              {showPinSetup ? <Shield size={32} /> : <Lock size={32} />}
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
              {showPinSetup ? 'Secure your Vault' : 'Unlock your Data'}
            </h2>
            <p className="text-sm mb-8 text-[var(--text-tertiary)]">
              {showPinSetup 
                ? 'Create a 6-digit PIN to encrypt your transactions. We never see this PIN.' 
                : 'Enter your 6-digit PIN to decrypt your financial records.'}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (showPinSetup) setupVault(pin)
              else unlockVault(pin)
            }} className="space-y-6">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="input-minimal text-center text-4xl tracking-[0.5em] py-6 w-full"
                required
                autoFocus
              />

              {error && (
                <p className="text-xs text-[var(--danger)] animate-shake">{error}</p>
              )}

              <button 
                type="submit" 
                disabled={loading || pin.length < 4}
                className="btn-apple-primary w-full py-4 text-base"
              >
                {loading ? 'Processing...' : (showPinSetup ? 'Enable E2EE' : 'Unlock')}
              </button>
            </form>
          </div>
        </div>
      )}
    </VaultContext.Provider>
  )
}

export const useVault = () => {
  const context = useContext(VaultContext)
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider')
  }
  return context
}
