
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { PasswordMatch } from './PasswordMatch';
import { PasswordInput } from './PasswordInput';
import { checkPasswordStrength } from '@/utils/passwordStrength';
import { supabase } from '@/integrations/supabase/client';

interface SignupFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

export const SignupForm = ({ onSubmit, error, isLoading = false }: SignupFormProps) => {
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [formIsValid, setFormIsValid] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // Verificar disponibilidade do username
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar username:', error);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(!data);
      }
    } catch (err) {
      console.error('Erro na verificação de username:', err);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounce para verificação de username
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);
  
  // Verifica a força da senha e se as senhas coincidem
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength('weak');
    }
    
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  // Valida o formulário completo
  useEffect(() => {
    const isEmailValid = email && email.includes('@') && email.includes('.');
    const isUsernameValid = username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username) && usernameAvailable === true;
    const isPasswordValid = password && password.length >= 6;
    const isPasswordStrengthValid = passwordStrength === 'medium' || passwordStrength === 'strong';
    const isConfirmPasswordValid = confirmPassword && password === confirmPassword;
    
    const isValid = isEmailValid && 
                    isUsernameValid &&
                    isPasswordValid && 
                    isPasswordStrengthValid && 
                    isConfirmPasswordValid;
    
    console.log('Validade do formulário:', {
      isEmailValid,
      isUsernameValid,
      isPasswordValid,
      isPasswordStrengthValid,
      isConfirmPasswordValid,
      formIsValid: isValid
    });
    
    setFormIsValid(isValid);
  }, [email, username, password, confirmPassword, passwordStrength, usernameAvailable]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Verifica novamente todos os campos antes de enviar
    if (!email || !email.includes('@') || !email.includes('.')) {
      console.log('Email inválido no envio:', email);
      return;
    }
    
    if (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      console.log('Username inválido no envio:', username);
      return;
    }
    
    if (usernameAvailable !== true) {
      console.log('Username não disponível no envio');
      return;
    }
    
    if (!password || password.length < 6) {
      console.log('Senha muito curta no envio:', { passwordLength: password.length });
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('Senhas não conferem no envio');
      setPasswordsMatch(false);
      return;
    }
    
    const passwordStr = checkPasswordStrength(password);
    if (passwordStr === 'weak') {
      console.log('Senha fraca no envio');
      return;
    }
    
    console.log('Formulário válido, enviando dados:', { email, username });
    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className={submitAttempted && (!email || !email.includes('@') || !email.includes('.')) ? "border-red-500" : ""}
        />
        {submitAttempted && (!email || !email.includes('@') || !email.includes('.')) && (
          <p className="text-sm text-red-500 mt-1">Por favor, insira um email válido</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nome de usuário</Label>
        <Input 
          id="username" 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
          placeholder="usuario123"
          required
          className={
            submitAttempted && (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username) || usernameAvailable === false) 
              ? "border-red-500" 
              : usernameAvailable === true 
                ? "border-green-500" 
                : ""
          }
        />
        {username && username.length >= 3 && (
          <div className="text-xs mt-1">
            {checkingUsername ? (
              <span className="text-gray-500">Verificando disponibilidade...</span>
            ) : usernameAvailable === true ? (
              <span className="text-green-600">✓ Nome de usuário disponível</span>
            ) : usernameAvailable === false ? (
              <span className="text-red-500">✗ Nome de usuário já em uso</span>
            ) : null}
          </div>
        )}
        {submitAttempted && (!username || username.length < 3) && (
          <p className="text-sm text-red-500 mt-1">Nome de usuário deve ter pelo menos 3 caracteres</p>
        )}
        {submitAttempted && username && username.length >= 3 && !/^[a-zA-Z0-9_]+$/.test(username) && (
          <p className="text-sm text-red-500 mt-1">Nome de usuário deve conter apenas letras, números e underscore</p>
        )}
        {submitAttempted && usernameAvailable === false && (
          <p className="text-sm text-red-500 mt-1">Este nome de usuário já está em uso</p>
        )}
        <p className="text-xs text-gray-500">Apenas letras, números e underscore. Mínimo 3 caracteres.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput 
          id="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mb-1 ${submitAttempted && (!password || password.length < 6) ? "border-red-500" : ""}`}
        />
        <PasswordStrengthIndicator strength={passwordStrength} />
        {submitAttempted && (!password || password.length < 6) && (
          <p className="text-sm text-red-500 mt-1">A senha deve ter pelo menos 6 caracteres</p>
        )}
        {submitAttempted && passwordStrength === 'weak' && password.length >= 6 && (
          <p className="text-sm text-red-500 mt-1">A senha é muito fraca</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Senha</Label>
        <PasswordInput 
          id="confirm-password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={submitAttempted && (!confirmPassword || password !== confirmPassword) ? "border-red-500" : ""}
        />
        <PasswordMatch 
          passwordsMatch={passwordsMatch} 
          confirmPassword={confirmPassword} 
        />
        {submitAttempted && (!confirmPassword || password !== confirmPassword) && (
          <p className="text-sm text-red-500 mt-1">As senhas não conferem</p>
        )}
      </div>
      
      {error && (
        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/30">
          <p className="text-sm text-destructive flex items-center">
            <AlertCircle size={14} className="mr-2 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !formIsValid}
      >
        {isLoading ? 'Processando...' : 'Criar Conta'}
      </Button>
    </form>
  );
};
