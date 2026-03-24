import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/blog/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setPost(data.data);
                } else {
                    setError(data.message);
                }
            })
            .catch(err => {
                console.error("Error:", err);
                setError("Failed to load post");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return <div className="text-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
    }

    if (error || !post) {
        return <div className="text-center py-32 text-red-500 font-bold text-2xl">{error || 'Article not found'}</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            <Helmet>
                <title>{post.title} | Aamya Travel Journal</title>
                {post.excerpt && <meta name="description" content={post.excerpt} />}
            </Helmet>
            <div className="w-full px-4 py-16 sm:px-8 lg:px-12">
                <nav className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
                    <Link to="/blog" className="hover:text-indigo-600 font-medium">Travel Journal</Link>
                    <span className="mx-3 text-slate-300">&gt;</span>
                    <span className="text-slate-900 font-bold">{post.title}</span>
                </nav>

                <article>
                    <header className="mb-12">
                        <div className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
                            Guide &bull; {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                        </div>
                        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-8">
                            {post.title}
                        </h1>

                        <div className="w-full h-96 bg-slate-100 rounded-3xl overflow-hidden shadow-md mb-12">
                            <img 
                                src={post.image_url || `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=600&fit=crop`} 
                                alt={post.title} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                    </header>

                    <div className="prose prose-lg prose-teal marker:text-teal-400 w-full max-w-none break-words overflow-x-hidden text-slate-700 mx-auto leading-loose">
                        <p className="text-2xl font-light text-slate-500 mb-8 italic border-l-4 border-teal-200 pl-6">
                            {post.excerpt}
                        </p>
                        <div className="mt-8 space-y-6" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
                        <Link to="/blog" className="text-indigo-600 font-bold hover:underline inline-flex items-center">
                            &larr; Back to all articles
                        </Link>
                        
                        <div className="flex space-x-3">
                            <button className="bg-slate-100 p-3 rounded-full hover:bg-slate-200 transition text-slate-600 shadow-sm">✉️</button>
                            <button className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition text-indigo-700 shadow-sm">🔖</button>
                        </div>
                    </div>
                </article>

            </div>
        </div>
    );
};

export default BlogPost;
