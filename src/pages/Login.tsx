import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useMutation } from '@tanstack/react-query'
import { loginRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short').required('Required'),
})

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: loginRequest,
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 p-10 text-white">
        <div className="max-w-sm">
          <div className="mb-4 text-3xl font-semibold leading-tight">Digital Asset Manager</div>
          <p className="text-white/80">Organize, preview, and share your creative assets with ease.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
          <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values) => {
            const res = await mutateAsync(values)
            login(res.token)
            navigate('/')
          }}
          >
            {() => (
              <Form className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <div className="mt-1 text-sm text-red-600">
                    <ErrorMessage name="email" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Password</label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <div className="mt-1 text-sm text-red-600">
                    <ErrorMessage name="password" />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">Login failed</div>
                ) : null}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? 'Signing in…' : 'Sign in'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}


