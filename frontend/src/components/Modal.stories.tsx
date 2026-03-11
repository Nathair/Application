import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { fn } from '@storybook/test';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Info: Story = {
  args: {
    type: 'info',
    title: 'Success!',
    message: 'Your event has been successfully published to the platform.',
  },
};

export const Confirm: Story = {
  args: {
    type: 'confirm',
    title: 'Delete Event',
    message: 'Are you sure you want to delete this event? This action cannot be undone.',
    confirmLabel: 'Delete',
    onConfirm: fn(),
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Something went wrong',
    message: 'We could not process your request at this time. Please try again later.',
  },
};
