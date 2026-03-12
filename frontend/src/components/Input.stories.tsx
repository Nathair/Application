import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Search, Lock, MapPin } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
    label: 'Default Input',
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: 'Search events...',
    label: 'Search',
    icon: <Search size={16} />,
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'john@example.com',
    label: 'Email Address',
    icon: <Mail size={16} />,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '••••••••',
    label: 'Password',
    icon: <Lock size={16} />,
  },
};

export const Location: Story = {
  args: {
    placeholder: 'e.g. London, UK',
    label: 'Location',
    icon: <MapPin size={16} />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Age',
    defaultValue: 'abc',
    error: 'Age must be a number',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Readonly',
    value: 'This is disabled',
    disabled: true,
  },
};
