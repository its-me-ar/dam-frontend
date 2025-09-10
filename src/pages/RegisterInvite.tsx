import { useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { registerWithInvite } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function RegisterInvitePage() {
  usePageTitle();
  const [params] = useSearchParams();
  const token = params.get('token');

  let email: string | undefined;
  let role: string | undefined;
  let isExpired = false;
  let expDate: Date | undefined;
  try {
    if (token) {
      const payload = jwtDecode<{
        email?: string;
        role?: string;
        exp?: number;
      }>(token);
      email = payload.email;
      role = payload.role;
      if (payload.exp) {
        expDate = new Date(payload.exp * 1000);
        isExpired = Date.now() >= expDate.getTime();
      }
    }
  } catch {
    // Token is invalid or expired
  }

  const { notifySuccess, notifyError } = useToast();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: registerWithInvite,
    onSuccess: () => {
      notifySuccess('Registration successful. You can now sign in.');
      const search = email ? `?email=${encodeURIComponent(email)}` : '';
      navigate(`/login${search}`, { replace: true });
    },
    onError: () => notifyError('Registration failed'),
  });

  const Schema = Yup.object().shape({
    full_name: Yup.string().min(3).max(80).required('Full name is required'),
    password: Yup.string()
      .min(8, 'At least 8 characters')
      .required('Password is required'),
  });
  return (
    <div className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
      <div className='hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 p-10 text-white'>
        <div className='max-w-sm'>
          <div className='mb-4 text-3xl font-semibold leading-tight'>
            Digital Asset Manager
          </div>
          <p className='text-white/80'>
            Accept your invitation to collaborate, upload and manage assets.
          </p>
        </div>
      </div>
      <div className='flex items-center justify-center p-6 md:p-10'>
        <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
          <h1 className='mb-2 text-2xl font-semibold'>Accept Invitation</h1>
          {!token ? (
            <div className='text-sm text-red-600'>Missing token</div>
          ) : isExpired ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              Invitation expired
              {expDate ? ` on ${expDate.toLocaleString()}` : ''}. Ask the
              inviter to resend.
            </div>
          ) : (
            <Formik
              initialValues={{ full_name: '', password: '' }}
              validationSchema={Schema}
              onSubmit={async values => {
                await mutation.mutateAsync({ token, ...values });
              }}
            >
              {() => (
                <Form className='space-y-5'>
                  <div className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm'>
                    <div className='text-gray-700 truncate'>
                      {email ?? 'unknown'}
                    </div>
                    {role ? (
                      <span className='shrink-0 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700'>
                        {role}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Full name
                    </label>
                    <Field
                      name='full_name'
                      placeholder='Your full name'
                      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    />
                    <div className='mt-1 text-xs text-red-600'>
                      <ErrorMessage name='full_name' />
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Password
                    </label>
                    <Field
                      name='password'
                      type='password'
                      placeholder='••••••••'
                      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    />
                    <div className='mt-1 text-xs text-red-600'>
                      <ErrorMessage name='password' />
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <a
                      href='/login'
                      className='text-sm text-blue-600 hover:underline'
                    >
                      Already have an account? Sign in
                    </a>
                    <button
                      type='submit'
                      disabled={mutation.isPending}
                      className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50'
                    >
                      {mutation.isPending
                        ? 'Registering…'
                        : 'Accept & Register'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}
