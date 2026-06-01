import React from "react";

interface BrokenComponentProps {
  shouldBreak?: boolean;
}

const BrokenComponent: React.FC<BrokenComponentProps> = ({
  shouldBreak = true,
}) => {
  if (shouldBreak) {
    throw new Error(
      "This component is intentionally broken to test ErrorBoundary functionality",
    );
  }

  return (
    <div>
      <h2>This component should not render</h2>
      <p>If you see this, the ErrorBoundary is not working properly.</p>
    </div>
  );
};

export default BrokenComponent;
