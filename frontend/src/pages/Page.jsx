import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Page = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/aamya_holiday/backend/public/api/pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data && data.data.is_published == 1) {
          setPage(data.data);
          document.title = `${data.data.title} | Aamya Holidays`;
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
      );
  }

  if (error || !page) {
      return (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-50 text-center px-4">
              <h1 className="text-8xl font-black text-slate-200 mb-4">404</h1>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-6 tracking-tight">Paperwork missing.</h2>
              <p className="text-slate-500 mb-8 max-w-md text-lg leading-relaxed">The document or page you're searching for hasn't been written yet or was moved.</p>
              <Link to="/" className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl shadow-lg transition transform hover:-translate-y-1">
                  Return to Home
              </Link>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <Helmet>
        <title>{page.title} | Aamya Holidays</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>
      <main className="w-full px-4 sm:px-8 lg:px-12">
        
        <header className="mb-12 text-center">
            <h1 className="text-5xl border-b pb-8 border-slate-200 md:text-6xl font-black text-slate-900 tracking-tight leading-tight drop-shadow-sm">
                {page.title}
            </h1>
        </header>

        <article className="prose prose-lg prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-teal-600 max-w-none w-full break-words overflow-x-hidden bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-slate-100">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
      </main>
    </div>
  );
};

export default Page;
