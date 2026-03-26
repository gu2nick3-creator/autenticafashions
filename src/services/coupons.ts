import { api } from '@/lib/api';
import { Coupon } from '@/types';

interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
}

export const couponService = {
  validate: (code: string) => api.post<ValidateCouponResponse>('/api/coupons/validate', { code }),
};
