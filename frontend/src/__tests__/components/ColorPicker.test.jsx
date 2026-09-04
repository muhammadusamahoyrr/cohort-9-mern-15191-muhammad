import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from '../../components/ColorPicker';
import { NOTE_COLORS } from '../../components/notePalette';

describe('ColorPicker', () => {
  it('opens swatch dialog when toggle button is clicked', async () => {
    render(<ColorPicker onChange={jest.fn()} />);

    const toggle = screen.getByRole('button', { name: 'Note colour' });
    await userEvent.click(toggle);

    expect(screen.getByRole('dialog', { name: 'Note colour' })).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  it('selects a color and notifies onChange', async () => {
    const onChange = jest.fn();
    render(<ColorPicker onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Note colour' }));

    const targetColor = NOTE_COLORS[2];
    const swatch = screen.getByRole('button', { name: targetColor });
    await userEvent.click(swatch);

    expect(onChange).toHaveBeenCalledWith(targetColor);
  });

  it('closes dialog when Done is clicked', async () => {
    render(<ColorPicker onChange={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Note colour' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
