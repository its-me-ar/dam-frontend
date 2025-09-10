import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  sendInvitation,
  type InvitePayload,
  fetchInvitations,
  reinviteInvitation,
} from '../lib/api';
import { useToast } from '../hooks/useToast';
import { usePageTitle } from '../hooks/usePageTitle';

export default function UsersPage() {
  usePageTitle();
  const { notifySuccess, notifyError } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitePayload['role']>('USER');
  const [urlById, setUrlById] = useState<Record<string, string>>({});
  const setGeneratedUrlFor = (id: string, url: string) =>
    setUrlById(m => ({ ...m, [id]: url }));
  const dismissGeneratedUrlFor = (id: string) =>
    setUrlById(m => {
      const { [id]: _, ...rest } = m;
      return rest;
    });
  const invite = useMutation({
    mutationFn: sendInvitation,
    onSuccess: data => {
      notifySuccess('Invitation sent successfully');
      setEmail('');
      const url = `${location.origin}/register/invite?token=${encodeURIComponent(data.invitationLink)}`;
      setGeneratedUrlFor(data.id, url);
      navigator.clipboard?.writeText(url).catch(() => {});
      refetch();
    },
    onError: () => {
      notifyError('Failed to send invitation');
    },
  });

  const {
    data: invites,
    isLoading,
    refetch,
  } = useQuery({ queryKey: ['invitations'], queryFn: fetchInvitations });
  const reinvite = useMutation({
    mutationFn: (id: string) => reinviteInvitation(id),
    onSuccess: data => {
      notifySuccess('Invitation re-sent');
      const url = `${location.origin}/register/invite?token=${encodeURIComponent(data.invitationLink)}`;
      setGeneratedUrlFor(data.id, url);
      navigator.clipboard?.writeText(url).catch(() => {});
      refetch();
    },
    onError: () => notifyError('Failed to re-send invitation'),
  });

  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Users</h1>
      <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-3 text-sm font-medium text-gray-800'>
          Invite a new user
        </div>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type='email'
            placeholder='Email'
            className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value as InvitePayload['role'])}
            className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
          >
            <option value='USER'>USER</option>
            <option value='MANAGER'>MANAGER</option>
          </select>
          <button
            onClick={() => invite.mutate({ email, role })}
            disabled={!email || invite.isPending}
            className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50'
          >
            {invite.isPending ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
      </div>
      <div className='mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='mb-3 text-sm font-medium text-gray-800'>
          Invitations
        </div>
        {/* Desktop table */}
        <div className='hidden md:block overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                  Email
                </th>
                <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                  Role
                </th>
                <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                  Status
                </th>
                <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                  Invited By
                </th>
                <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                  Created
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                <tr>
                  <td className='px-3 py-3' colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : invites?.length ? (
                invites.map(inv => (
                  <>
                    <tr key={inv.id}>
                      <td className='px-3 py-2'>{inv.email}</td>
                      <td className='px-3 py-2'>{inv.role}</td>
                      <td className='px-3 py-2'>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs ${inv.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : inv.status === 'JOINED' || inv.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className='px-3 py-2'>{inv.invitedBy.full_name}</td>
                      <td className='px-3 py-2'>
                        <div className='flex items-center gap-2'>
                          <span>
                            {new Date(inv.createdAt).toLocaleString()}
                          </span>
                          {inv.status === 'PENDING' ? (
                            <button
                              onClick={() => reinvite.mutate(inv.id)}
                              className='inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-sm hover:bg-gray-50'
                              title='Re-send invitation'
                            >
                              <RefreshCcw className='h-3.5 w-3.5' />
                              Reinvite
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {urlById[inv.id] ? (
                      <tr>
                        <td colSpan={5} className='px-3 py-2'>
                          <div className='rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs'>
                            <div className='mb-1 flex items-center justify-between'>
                              <div className='font-medium text-blue-800'>
                                Invitation URL
                              </div>
                              <button
                                onClick={() => dismissGeneratedUrlFor(inv.id)}
                                className='rounded-md px-2 py-1 text-blue-700 hover:bg-blue-100'
                              >
                                Dismiss
                              </button>
                            </div>
                            <div className='flex items-center gap-2'>
                              <code className='flex-1 break-all text-blue-900'>
                                {urlById[inv.id]}
                              </code>
                              <button
                                onClick={() =>
                                  navigator.clipboard?.writeText(
                                    urlById[inv.id]
                                  )
                                }
                                className='shrink-0 rounded-md border border-blue-200 bg-white px-2 py-1 text-xs text-blue-700 hover:bg-blue-100'
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </>
                ))
              ) : (
                <tr>
                  <td className='px-3 py-3 text-gray-500' colSpan={5}>
                    No invitations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile accordion */}
        <div className='md:hidden'>
          {isLoading ? (
            <div className='text-sm text-gray-500'>Loading…</div>
          ) : invites?.length ? (
            <div className='space-y-2'>
              {invites.map(inv => (
                <details
                  key={inv.id}
                  className='rounded-xl border border-gray-200 bg-white p-3'
                >
                  <summary className='cursor-pointer list-none'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>{inv.email}</div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs ${inv.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : inv.status === 'JOINED' || inv.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </summary>
                  <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <div className='text-gray-500'>Role</div>
                      <div className='text-gray-800'>{inv.role}</div>
                    </div>
                    <div>
                      <div className='text-gray-500'>Invited By</div>
                      <div className='text-gray-800'>
                        {inv.invitedBy.full_name}
                      </div>
                    </div>
                    <div className='col-span-2'>
                      <div className='text-gray-500'>Created</div>
                      <div className='flex items-center justify-between text-gray-800'>
                        <span>{new Date(inv.createdAt).toLocaleString()}</span>
                        {inv.status === 'PENDING' ? (
                          <button
                            onClick={() => reinvite.mutate(inv.id)}
                            className='inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-sm hover:bg-gray-50'
                            title='Re-send invitation'
                          >
                            <RefreshCcw className='h-3.5 w-3.5' />
                            Reinvite
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className='text-sm text-gray-500'>No invitations</div>
          )}
        </div>
      </div>
    </div>
  );
}
