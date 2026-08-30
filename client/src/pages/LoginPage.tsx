import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth.ts'
import { getErrorMessage } from '../api/http.ts'
import type { LoginInput } from '../api/types.ts'
import { currentUserQueryKey } from '../auth/useCurrentUser.ts'

export function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(currentUserQueryKey, user)
      navigate('/clubs', { replace: true })
    },
  })

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate({
      email: values.email.trim(),
      password: values.password,
    })
  })

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-heading">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to CampusFlow</h2>
        <p>Continue to your club workspace.</p>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {loginMutation.isError ? (
          <div className="form-alert" role="alert">
            {getErrorMessage(loginMutation.error)}
          </div>
        ) : null}

        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              required: 'Email is required.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address.',
              },
            })}
          />
          {errors.email ? (
            <p className="field-error" id="email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: 'Password is required.',
            })}
          />
          {errors.password ? (
            <p className="field-error" id="password-error">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          className="button button--primary button--wide"
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <LoaderCircle className="spin" size={18} aria-hidden="true" />
          ) : (
            <ArrowRight size={18} aria-hidden="true" />
          )}
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        New to CampusFlow? <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}
