
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { useTheme } from 'next-themes';

const Settings = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, loading, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || user.email || '');
        setPhone(data.phone || '');
        const isDarkMode = data.dark_mode || false;
        setDarkMode(isDarkMode);
        setTheme(isDarkMode ? 'dark' : 'light');
        setCompactView(data.compact_view ?? true);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          dark_mode: darkMode,
          compact_view: compactView,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save settings');
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Settings">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <SettingsTabs
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            compactView={compactView}
            setCompactView={setCompactView}
            onSave={handleSave}
            onCancel={loadProfile}
            saving={saving}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
