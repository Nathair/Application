import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Calendar, Send, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete Event',
    variant: 'danger',
    icon: <Trash2 size={16} />,
  },
};

export const Outline: Story = {
  args: {
    children: 'Cancel',
    variant: 'outline',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    isLoading: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Send Message',
    icon: <Send size={16} />,
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
    icon: <Calendar size={20} />,
  },
};
