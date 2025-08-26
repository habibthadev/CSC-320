import { useState, useRef } from "react";
import { User, Mail, Lock, Save, Settings, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { Spinner } from "../../components/ui/Spinner";
import { Avatar } from "../../components/ui/Avatar";
import { Alert } from "../../components/ui/Alert";
import { useAuth, useProfile, useUpdateProfile } from "../../hooks/useAuth";

const ProfileView = () => {
  const { user } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const formRef = useRef(null);

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const validateProfile = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    updateProfileMutation.mutate(
      { password: passwordData.newPassword },
      {
        onSuccess: () => {
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <User className="h-10 w-10" />
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{user?.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" ref={formRef}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information and personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updateProfileMutation.isError && (
                  <Alert variant="destructive" className="mb-6">
                    {updateProfileMutation.error?.message ||
                      "Failed to update profile"}
                  </Alert>
                )}
                {updateProfileMutation.isSuccess && (
                  <Alert className="mb-6">Profile updated successfully!</Alert>
                )}
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" required>
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        className="pl-10"
                        error={errors.name}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" required>
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleProfileChange}
                        className="pl-10"
                        error={errors.email}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  onClick={handleProfileSubmit}
                  isLoading={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updateProfileMutation.isError && (
                  <Alert variant="destructive" className="mb-6">
                    {updateProfileMutation.error?.message ||
                      "Failed to update password"}
                  </Alert>
                )}
                {updateProfileMutation.isSuccess && (
                  <Alert className="mb-6">Password updated successfully!</Alert>
                )}
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" required>
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="pl-10"
                        error={errors.currentPassword}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" required>
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="pl-10"
                        error={errors.newPassword}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" required>
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="pl-10"
                        error={errors.confirmPassword}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  onClick={handlePasswordSubmit}
                  isLoading={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
