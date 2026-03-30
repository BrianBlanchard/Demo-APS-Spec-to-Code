export const Channel = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
} as const;

export type ChannelType = (typeof Channel)[keyof typeof Channel];

export const isValidChannel = (value: string): value is ChannelType => {
  return Object.values(Channel).includes(value as ChannelType);
};
