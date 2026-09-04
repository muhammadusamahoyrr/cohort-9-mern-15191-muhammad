import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders title, message, and action buttons', () => {
    render(
      <ConfirmDialog
        title="Delete item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('triggers onConfirm when confirm button clicked', async () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        title="Confirm action"
        message="Proceed?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('triggers onCancel when Escape key is pressed', async () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        title="Confirm action"
        message="Proceed?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('traps focus with Tab and Shift+Tab', async () => {
    render(
      <ConfirmDialog
        title="Focus trap"
        message="Check tab behavior"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });

    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);

    await userEvent.tab();
    expect(document.activeElement).toBe(confirmBtn);

    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(cancelBtn);
  });
});
