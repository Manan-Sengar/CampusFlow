import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from '../api/auth.ts'
import { getErrorMessage } from '../api/http.ts'
import type { RegisterInput } from '../api/types.ts'
import { currentUserQueryKey } from '../auth/useCurrentUser.ts'

export function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(currentUserQueryKey, user)
      navigate('/clubs', { replace: true })
    },
  })

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    })
  })

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-heading">
        <p className="eyebrow">Create your account</p>
        <h2>Start with CampusFlow</h2>
        <p>Use one account across every club you join.</p>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {registerMutation.isError ? (
          <div className="form-alert" role="alert">
            {getErrorMessage(registerMutation.error)}
          </div>
        ) : null}

        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name', {
              required: 'Name is required.',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters.',
              },
              maxLength: {
                value: 100,
                message: 'Name must be 100 characters or fewer.',
              },
            })}
          />
          {errors.name ? (
            <p className="field-error" id="name-error">
              {errors.name.message}
            </p>
          ) : null}
        </div>

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
              maxLength: {
                value: 255,
                message: 'Email must be 255 characters or fewer.',
              },
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
          <div className="form-field__label-row">
            <label htmlFor="password">Password</label>
            <span>8–128 characters</span>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a secure password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: 'Password is required.',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters.',
              },
              maxLength: {
                value: 128,
                message: 'Password must be 128 characters or fewer.',
              },
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <LoaderCircle className="spin" size={18} aria-hidden="true" />
          ) : (
            <ArrowRight size={18} aria-hidden="true" />
          )}
          {registerMutation.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  )
}
