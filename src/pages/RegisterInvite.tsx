import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { registerWithInvite } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMemo, useCallback } from 'react';
import type { Role } from '../types/auth';

interface JwtPayload {
  email?: string;
  role?: Role;
  exp?: number;
}

interface FormValues {
  full_name: string;
  password: string;
}

interface TokenValidationResult {
  email: string | undefined;
  role: Role | undefined;
  isExpired: boolean;
  expDate: Date | undefined;
  isValid: boolean;
}

export default function RegisterInvitePage() {
  usePageTitle();
  const [params] = useSearchParams();
  const token = params.get('token');

  const tokenValidation = useMemo((): TokenValidationResult => {
    if (!token) {
      return {
        email: undefined,
        role: undefined,
        isExpired: false,
        expDate: undefined,
        isValid: false,
      };
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);
      const expDate = payload.exp ? new Date(payload.exp * 1000) : undefined;
      const isExpired = expDate ? Date.now() >= expDate.getTime() : false;

      return {
        email: payload.email,
        role: payload.role,
        isExpired,
        expDate,
        isValid: true,
      };
    } catch {
      return {
        email: undefined,
        role: undefined,
        isExpired: false,
        expDate: undefined,
        isValid: false,
      };
    }
  }, [token]);

  const { email, role, isExpired, expDate, isValid } = tokenValidation;

  const { notifySuccess, notifyError } = useToast();
  const navigate = useNavigate();

  const handleSuccess = useCallback(() => {
    notifySuccess('Registration successful. You can now sign in.');
    const search = email ? `?email=${encodeURIComponent(email)}` : '';
    navigate(`/login${search}`, { replace: true });
  }, [notifySuccess, navigate, email]);

  const handleError = useCallback(() => {
    notifyError('Registration failed. Please try again.');
  }, [notifyError]);

  const mutation = useMutation({
    mutationFn: registerWithInvite,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        full_name: Yup.string()
          .min(3, 'Full name must be at least 3 characters')
          .max(80, 'Full name must be less than 80 characters')
          .required('Full name is required'),
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
          )
          .required('Password is required'),
      }),
    []
  );

  const initialValues: FormValues = useMemo(
    () => ({
      full_name: '',
      password: '',
    }),
    []
  );

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      if (!token) return;
      await mutation.mutateAsync({ token, ...values });
    },
    [token, mutation]
  );
  const renderErrorState = () => {
    if (!token) {
      return (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          <h3 className='font-medium'>Invalid Invitation</h3>
          <p>This invitation link is missing or invalid.</p>
        </div>
      );
    }

    if (!isValid) {
      return (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          <h3 className='font-medium'>Invalid Token</h3>
          <p>The invitation token is malformed or corrupted.</p>
        </div>
      );
    }

    if (isExpired) {
      return (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          <h3 className='font-medium'>Invitation Expired</h3>
          <p>
            This invitation expired
            {expDate ? ` on ${expDate.toLocaleString()}` : ''}. Please ask the
            inviter to send a new invitation.
          </p>
        </div>
      );
    }

    return null;
  };

  const renderForm = () => (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className='space-y-5'>
          <div className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm'>
            <div className='text-gray-700 truncate' title={email}>
              {email ?? 'unknown'}
            </div>
            {role ? (
              <span className='shrink-0 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700'>
                {role}
              </span>
            ) : null}
          </div>

          <div>
            <label
              htmlFor='full_name'
              className='mb-1 block text-sm font-medium'
            >
              Full name
            </label>
            <Field
              id='full_name'
              name='full_name'
              placeholder='Your full name'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
            />
            <div className='mt-1 text-xs text-red-600'>
              <ErrorMessage name='full_name' />
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='mb-1 block text-sm font-medium'
            >
              Password
            </label>
            <Field
              id='password'
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
              className='text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
            >
              Already have an account? Sign in
            </a>
            <button
              type='submit'
              disabled={isSubmitting || mutation.isPending}
              className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting || mutation.isPending
                ? 'Registering…'
                : 'Accept & Register'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
      <div className='hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 p-10 text-white'>
        <div className='max-w-sm'>
          <h2 className='mb-4 text-3xl font-semibold leading-tight'>
            Digital Asset Manager
          </h2>
          <p className='text-white/80'>
            Accept your invitation to collaborate, upload and manage assets.
          </p>
        </div>
      </div>
      <div className='flex items-center justify-center p-6 md:p-10'>
        <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
          <h1 className='mb-2 text-2xl font-semibold'>Accept Invitation</h1>
          {renderErrorState() || renderForm()}
        </div>
      </div>
    </div>
  );
}
