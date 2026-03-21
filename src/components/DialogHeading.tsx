import React from 'react';

interface DialogHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

const DialogHeading: React.FC<DialogHeadingProps> = ({ eyebrow, title, description }) => (
  <div className="dialog-heading">
    <span className="dialog-heading-eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
);

export default DialogHeading;
