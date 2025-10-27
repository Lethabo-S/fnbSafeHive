import { useState } from 'react';
import { EmergencyContact } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Phone, Trash2, Users } from 'lucide-react';

type ContactsListProps = {
  contacts: EmergencyContact[];
  onContactsChange: () => void;
};

export function ContactsList({ contacts, onContactsChange }: ContactsListProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (contacts.length >= 5) {
      setError('Maximum 5 emergency contacts allowed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newContact: EmergencyContact = {
        id: `local-${Date.now()}`,
        user_id: user.id,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        created_at: new Date().toISOString(),
      };

      const localContacts = JSON.parse(localStorage.getItem(`contacts_${user.id}`) || '[]');
      localContacts.push(newContact);
      localStorage.setItem(`contacts_${user.id}`, JSON.stringify(localContacts));

      setContactName('');
      setContactPhone('');
      setIsAdding(false);
      onContactsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) return;
    if (!user) return;

    try {
      const localContacts = JSON.parse(localStorage.getItem(`contacts_${user.id}`) || '[]');
      const updatedContacts = localContacts.filter((c: EmergencyContact) => c.id !== contactId);
      localStorage.setItem(`contacts_${user.id}`, JSON.stringify(updatedContacts));

      onContactsChange();
    } catch (err) {
      alert('Failed to delete contact. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Emergency Contacts</h3>
            <p className="text-sm text-gray-500">
              {contacts.length} of 5 contacts added
            </p>
          </div>
        </div>
        {!isAdding && contacts.length < 5 && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            <UserPlus className="w-5 h-5" />
            Add Contact
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddContact} className="mb-6 p-6 bg-gray-50 rounded-xl border-2 border-red-200">
          <h4 className="font-semibold text-gray-900 mb-4">Add New Emergency Contact</h4>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Mom, Sister, Friend..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+27 XX XXX XXXX"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g., +27 for South Africa)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Contact'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setContactName('');
                  setContactPhone('');
                  setError('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No emergency contacts added yet</p>
          <p className="text-sm text-gray-500">
            Add trusted contacts who will receive your emergency alerts
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-200 transition"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {contact.contact_name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">{contact.contact_phone}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                aria-label="Delete contact"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
