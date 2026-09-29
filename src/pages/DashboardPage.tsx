export function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Good day</h1>
          <p>Here's what's on your plate today.</p>
        </div>
      </header>
      <section className="card" aria-labelledby="today-heading">
        <h2 id="today-heading">Today</h2>
        <p className="muted">Placeholder: today's tasks will appear here.</p>
      </section>
    </>
  )
}
