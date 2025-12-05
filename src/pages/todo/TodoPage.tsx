import Navigation from '../../components/Navigation';

function TodoPage() {
  return (
    <div
      className="theme-bg-gradient min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Navigation />

      <main className="px-4 pt-16 pb-20 md:pt-20 md:pb-0">
        <div className="mx-auto max-w-4xl py-8">
          <h1
            className="mb-4 text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Todo
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Todo 페이지입니다.</p>
        </div>
      </main>
    </div>
  );
}

export default TodoPage;
