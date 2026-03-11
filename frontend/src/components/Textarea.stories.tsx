import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { AlignLeft } from 'lucide-react';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Tell us about your event...',
    label: 'Description',
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: 'Enter details...',
    label: 'Detailed Info',
    icon: <AlignLeft size={16} />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'Too short',
    error: 'Bio must be at least 20 characters',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Readonly Content',
    value: 'This field represents static text that cannot be edited.',
    disabled: true,
  },
};
