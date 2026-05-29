// Privacy & Security Settings Model

export const createPrivacySettings = ({
  twoFactor = false,
  publicProfile = true,
  dataSharing = false,
} = {}) => ({
  twoFactor,
  publicProfile,
  dataSharing,
});

export default createPrivacySettings;
