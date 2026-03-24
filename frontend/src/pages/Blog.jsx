import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost/aamya_holiday/backend/public/api/blog')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setPosts(data.data);
                }
            })
            .catch(err => console.error("Error fetching blog:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen py-16">
            <div className="w-full px-4 sm:px-8 lg:px-12">
                
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl mb-4">Travel Journal</h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500">
                        Tips, guides, and stories to inspire your next adventure.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {posts.length > 0 ? posts.map(post => (
                            <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden">
                                <div className="h-48 bg-slate-200 overflow-hidden relative">
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-4 z-10" />
                                    {/* Using a generic travel pattern since we don't have images in db yet */}
                                    <img 
                                        src={post.image_url || `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop`} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-in-out" 
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-white/90 backdrop-blur text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                                            Guide
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="text-sm text-slate-500 mb-3 font-medium">
                                        {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-600 mb-6 flex-1 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
                                        Read Article &rarr;
                                    </div>
                                </div>
                            </Link>
                        )) : (
                             <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-300 rounded-3xl">
                                 <h3 className="text-2xl font-bold text-slate-400">No stories published yet.</h3>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
