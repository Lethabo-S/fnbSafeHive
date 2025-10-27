import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyContact, Profile } from '../lib/supabase';
import { SOSButton } from './SOSButton';
import { ContactsList } from './ContactsList';
import { LogOut, UserCircle } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadContacts();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const localProfile = localStorage.getItem(`profile_${user.id}`);
    if (localProfile) {
      setProfile(JSON.parse(localProfile));
    } else {
      const newProfile: Profile = {
        id: user.id,
        full_name: user.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
      setProfile(newProfile);
    }
    setLoading(false);
  };

  const loadContacts = async () => {
    if (!user) return;

    const localContacts = localStorage.getItem(`contacts_${user.id}`);
    if (localContacts) {
      setContacts(JSON.parse(localContacts));
    } else {
      setContacts([]);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {profile?.full_name || 'User'}
              </h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <SOSButton contacts={contacts} userId={user!.id} userName={profile?.full_name || 'User'} />
          <ContactsList contacts={contacts} onContactsChange={loadContacts} />
        </div>
      </main>
    </div>
  );
}
