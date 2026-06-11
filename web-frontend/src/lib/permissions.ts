export const requestMicrophonePermission = async () => false;
export const requestLocationPermission = async () => false;
export const requestNotificationPermission = async () => false;
export const checkAllPermissions = async () => ({
  microphone: false,
  location: false,
  notifications: false
});
