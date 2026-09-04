import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoEditor from '../../components/TodoEditor';

describe('TodoEditor', () => {
  const sampleItems = [
    { id: '1', text: 'Buy groceries', done: false },
    { id: '2', text: 'Write report', done: true },
  ];

  it('renders open and completed items', () => {
    render(<TodoEditor items={sampleItems} onChange={jest.fn()} />);

    expect(screen.getByDisplayValue('Buy groceries')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Write report')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onChange when an item is ticked', async () => {
    const onChange = jest.fn();
    render(<TodoEditor items={sampleItems} onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Buy groceries' });
    await userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith([
      { id: '1', text: 'Buy groceries', done: true },
      { id: '2', text: 'Write report', done: true },
    ]);
  });

  it('calls onChange when item text changes', async () => {
    const onChange = jest.fn();
    render(<TodoEditor items={sampleItems} onChange={onChange} />);

    const input = screen.getByDisplayValue('Buy groceries');
    await userEvent.type(input, ' today');

    expect(onChange).toHaveBeenCalled();
  });

  it('adds a new item after pressing Enter', async () => {
    const onChange = jest.fn();
    render(<TodoEditor items={sampleItems} onChange={onChange} />);

    const input = screen.getByDisplayValue('Buy groceries');
    await userEvent.type(input, '{enter}');

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', text: 'Buy groceries' }),
        expect.objectContaining({ text: '', done: false }),
      ])
    );
  });

  it('removes item when backspace is pressed on empty text', async () => {
    const onChange = jest.fn();
    const items = [
      { id: '1', text: '', done: false },
      { id: '2', text: 'Second', done: false },
    ];
    render(<TodoEditor items={items} onChange={onChange} />);

    const input = screen.getAllByPlaceholderText('List item')[0];
    await userEvent.type(input, '{backspace}');

    expect(onChange).toHaveBeenCalledWith([{ id: '2', text: 'Second', done: false }]);
  });

  it('clears all completed items when trash button clicked', async () => {
    const onChange = jest.fn();
    render(<TodoEditor items={sampleItems} onChange={onChange} />);

    const clearBtn = screen.getByRole('button', { name: 'Clear completed items' });
    await userEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith([{ id: '1', text: 'Buy groceries', done: false }]);
  });
});
