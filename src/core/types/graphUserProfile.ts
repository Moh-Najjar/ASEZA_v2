/** Fields returned by Microsoft Graph GET /me that the portal uses. */
export interface GraphUserProfile {
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
  jobTitle: string | null;
  officeLocation: string | null;
}
