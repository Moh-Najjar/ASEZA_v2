export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  fullNameEn: string;
  fullNameAr: string;
  email: string;
  directorateId: number;
  directorateNameAr: string;
  directorateNameEn: string;
  activePeriodLabel: string;
  activePeriodLabelAr: string;
  kpiFormNameEn: string;
  kpiFormNameAr: string;
  roles: string[];
  preferredLanguage: string;
}
