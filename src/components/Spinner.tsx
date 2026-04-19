import './Spinner.css';

interface Props { size?: number; }

export default function Spinner({ size = 24 }: Props) {
  return (
    <div className="spinner" style={{ width: size, height: size }} aria-label="Loading" />
  );
}
