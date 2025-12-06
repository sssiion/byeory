import Navigation from './components/Navigation';
import DefaultPageRedirect from './components/DefaultPageRedirect';

function HomePage() {
  return (
    <div className="theme-bg-gradient min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 기본 페이지 리다이렉트 */}
      <DefaultPageRedirect />

      {/* 내비게이션 설정 */}
      <Navigation />

      {/* 메인 화면 */}
      <main className="px-8 pt-16 pb-20 md:px-25 md:pt-20 md:pb-0">
        <div className="mx-auto py-8">
          <h1 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            메인
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>메인 페이지입니다.</p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
