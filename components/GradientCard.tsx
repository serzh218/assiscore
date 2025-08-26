import React from 'react';

export function GradientCard() {
  return (
    <section className="font-sans">
      <div className="rounded-xl bg-gradient-to-r from-accent to-accent-2 p-[2px]">
        <div className="rounded-xl bg-card p-6 text-center text-text sm:p-8 sm:text-left">
          <h2 className="text-xl font-bold">Demo Card</h2>
          <p className="mt-2 text-sm">
            Этот блок использует градиент с кастомными цветами и шрифт Inter.
          </p>
        </div>
      </div>
    </section>
  );
}

export default GradientCard;
