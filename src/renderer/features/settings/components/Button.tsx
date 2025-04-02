interface ButtonProps {
  onClick: () => void;
  title: string;
}

export function Button(props: ButtonProps) {
  const { onClick, title } = props;

  return (
    <button
      type="button"
      className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20"
      onClick={onClick}
    >
      {title}
    </button>
  );
}
