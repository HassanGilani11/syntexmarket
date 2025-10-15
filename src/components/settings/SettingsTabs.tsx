import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface SettingsTabsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  compactView: boolean;
  setCompactView: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

export const SettingsTabs = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  darkMode,
  setDarkMode,
  compactView,
  setCompactView,
  onSave,
  onCancel,
  saving
}: SettingsTabsProps) => {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    setTheme(value ? 'dark' : 'light');
  };

  const handlePasswordChange = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error('Failed to send reset email');
    }
  };

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="w-full grid grid-cols-5">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="regional">Regional</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" className="ml-2" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive browser notifications</p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Price Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified of major price movements</p>
              </div>
              <Switch
                checked={priceAlerts}
                onCheckedChange={setPriceAlerts}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={() => toast.success('Notification settings saved!')}>
            Save Notification Settings
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="security" className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <div className="flex gap-2 mt-2">
                <Input type="password" value="••••••••" disabled />
                <Button variant="outline" onClick={handlePasswordChange}>
                  Change Password
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Click to receive a password reset email
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(value) => {
                  setTwoFactorEnabled(value);
                  toast.info(value ? '2FA would be enabled' : '2FA would be disabled');
                }}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="regional" className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Regional Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={() => toast.success('Regional settings saved!')}>
            Save Regional Settings
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Display Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compact View</p>
                <p className="text-sm text-muted-foreground">Show more data with less spacing</p>
              </div>
              <Switch
                checked={compactView}
                onCheckedChange={setCompactView}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
