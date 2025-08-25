import { useState, useRef } from "react";
import { User, Mail, Lock, Save } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Tabs, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
import Spinner from "../../components/ui/Spinner";
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Profile Settings
        </h1>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex overflow-x-auto">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </div>
          </div>

          <TabsContent value="profile" ref={formRef}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" required>
                      Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        className="pl-10"
                        error={errors.name}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" required>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
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
                  icon={Save}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="password" ref={formRef}>
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" required>
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                  icon={Save}
                >
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
