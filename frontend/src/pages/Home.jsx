import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const categories = [
    { name: "Seeds", icon: "potted_plant" },
    { name: "Fertilizers", icon: "science" },
    { name: "Pesticides", icon: "sanitizer" },
    { name: "Tools", icon: "handyman" },
    { name: "Nursery", icon: "nature_people" },
    { name: "Organic", icon: "eco" },
    { name: "Irrigation", icon: "water_drop" }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent z-10"></div>
          <img className="w-full h-full object-cover" alt="Hero background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF0w-B9ciVIbZgxLtGI_dG0JXZtX4reJ7-EDL3IiATHRi0-9pcJTO56BKMPBdCrg_k6prMMy_jNOTinEQHmmlmwK5IftFGXkQpRj6CdThn5oZVjLZHEoJXbzM51Pe-hplhcVBkjxhIh9k6zjRzp1eblUSfsGKE5GcDGCUfQ9DG0RWI0Wt2FIZfmDXJj-dO1TKYxMWN6ZOs38-7wkGs7C2BahRu8vaQUpdOMxws_b0RrERcF5IqLYLy0Wh3TlQU7BvZcsRj4tKzwIo" />
        </div>
        <div className="relative z-20 px-margin-desktop max-w-4xl">
          <div className="reveal">
            <h1 className="font-display-lg text-display-lg text-on-primary mb-sm">
              Verified Agricultural Products for Farmers &amp; Home Gardeners
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary/90 mb-lg max-w-2xl">
              Buy seeds, fertilizers, tools, and gardening essentials directly from trusted sellers. Join a community built on quality and growth.
            </p>
            <div className="flex flex-wrap gap-md">
              <Link to="/products" className="bg-primary-fixed text-on-primary-fixed px-xl py-4 rounded-lg font-title-lg font-bold hover:bg-primary transition-colors flex items-center gap-sm">
                Shop Now
                <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
              </Link>
              <Link to="/register" className="border-2 border-on-primary text-on-primary px-xl py-4 rounded-lg font-title-lg font-bold hover:bg-on-primary hover:text-primary transition-all">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
        {/* Floating Asset */}
        <div className="absolute right-margin-desktop bottom-24 hidden xl:block animate-float z-20">
          <div className="glass-card p-lg rounded-xl flex items-center gap-md shadow-lg border border-white/50">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container" data-icon="verified_user">verified_user</span>
            </div>
            <div>
              <p className="font-title-lg text-primary">100% Quality Seeds</p>
              <p className="font-label-sm text-on-surface-variant">Verified by Experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-xl px-margin-desktop max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-lg reveal">
          <h2 className="font-headline-lg text-headline-lg">Shop by Category</h2>
          <Link to="/products" className="text-primary font-label-md flex items-center gap-xs">View All <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-md">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col items-center gap-sm group cursor-pointer reveal" style={{ transitionDelay: `${index * 50}ms` }}>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-primary-container group-hover:scale-110">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary-container text-3xl" data-icon={cat.icon}>{cat.icon}</span>
              </div>
              <span className="font-label-md text-on-surface group-hover:text-primary transition-colors">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-surface-container-low py-xl px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-lg reveal">
            <div>
              <h2 className="font-headline-lg text-headline-lg">Featured Products</h2>
              <p className="text-on-surface-variant font-body-md">Hand-picked essentials for your next cultivation.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Product Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col reveal">
              <div className="relative h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Tomato seeds" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz_mdZvpBL6MwHUKf4JeArttfhCnWREY0M0XcrDsXQjEyrcIitl85XK4T3PUBTsy-5WwS4vm79lcBiRz0rKzpTTIx4WV7wNHOeOWFP6K-EPDXMc70AiWG4-AKMDlpW52vKzk2ssFs3XXCqpMTfCQIx5i-YwUEK7waMnrDCPkVfEJmvV1o8sYXzRJmcXx-Jnk6tYcMgUlY_ZtTo7ys8UtOu-N3XX4uYr59Gh7LLmB0tm290Bk3q1QhJaEDeGgLyqTx5s9Yv4cRARlg" />
                <div className="absolute top-sm right-sm bg-tertiary text-on-tertiary px-base py-xs rounded-full font-label-sm">-15%</div>
                <div className="absolute bottom-0 left-0 right-0 p-sm translate-y-full group-hover:translate-y-0 transition-transform bg-primary/20 backdrop-blur-sm">
                  <button className="w-full bg-primary text-white py-2 rounded-lg font-label-md flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart">add_shopping_cart</span>
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="p-md flex flex-col flex-grow">
                <div className="flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-tertiary-container text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-sm text-on-surface-variant">GreenHarvest Co.</span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">Premium Heirloom Tomato Seeds</h3>
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-[#ffb870] text-sm" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-on-surface">4.8</span>
                  <span className="font-label-sm text-on-surface-variant">(124 reviews)</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="font-headline-md text-primary">$12.50</span>
                    <span className="text-on-surface-variant line-through text-sm ml-xs">$14.99</span>
                  </div>
                  <div className="bg-secondary-container px-base py-xs rounded text-on-secondary-container font-label-sm">Best Seller</div>
                </div>
              </div>
            </div>
            
            {/* Product Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col reveal" style={{ transitionDelay: '100ms' }}>
              <div className="relative h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Fertilizer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkjQEJFigcPLz3dKf4AQgJCVdciJf6VdVd2MiBxrxpm98IS6qkouaHFPTs3z9nPrd92hzzPwJaHepy1glpqqmvAd6zNWKydkaZw63rl_Qo8dbHVv54iJvo0ymtw1kRcN-D3vtG-nTYz3zsQMcT07Cy5mF_eo0wHL2-ecb7avyjblmStIUuAKnGl0tagTUt5zqn9j41Kv-yZ3EyCKtTdZovgTDQGAgy6K4EfopsTUO49gdJCZxYOqnlYfWXkBzGE1bfG9aAQVOG9xY" />
                <div className="absolute bottom-0 left-0 right-0 p-sm translate-y-full group-hover:translate-y-0 transition-transform bg-primary/20 backdrop-blur-sm">
                  <button className="w-full bg-primary text-white py-2 rounded-lg font-label-md flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart">add_shopping_cart</span>
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="p-md flex flex-col flex-grow">
                <div className="flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-tertiary-container text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-sm text-on-surface-variant">AgriTech Pro</span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">Balanced NPK Liquid Fertilizer (1L)</h3>
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-[#ffb870] text-sm" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-on-surface">4.9</span>
                  <span className="font-label-sm text-on-surface-variant">(86 reviews)</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-headline-md text-primary">$24.99</span>
                  <span className="bg-secondary-container px-base py-xs rounded text-on-secondary-container font-label-sm">In Stock</span>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col reveal" style={{ transitionDelay: '200ms' }}>
              <div className="relative h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Tool set" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCncbba_rQkhzsmurUI-xo02R5_QTOkOSWUB13QdOUDdhzMlcD1IqW_lqOmTZiGmp_IzqEsd7QEnia7kYA6cG2xfrm2PL1tp21h_E_a1BzlDBgUxkUS3BW7FVrRWB4Q4vlAwZHFHYQcnEBWclmZtupB-dyJfiOeQ2UU5Co13Hr07rdTUa-MXwpMVHyI0TNIayvd3-OgigyXAg7SBGRxxTFtkiUWsiXfulBXYAXollayrP1a4D1nYNbs0-nbElUG8W3URk5wVVc6Bi4" />
                <div className="absolute bottom-0 left-0 right-0 p-sm translate-y-full group-hover:translate-y-0 transition-transform bg-primary/20 backdrop-blur-sm">
                  <button className="w-full bg-primary text-white py-2 rounded-lg font-label-md flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart">add_shopping_cart</span>
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="p-md flex flex-col flex-grow">
                <div className="flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-tertiary-container text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-sm text-on-surface-variant">IronRoot Tools</span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">Ergonomic Stainless Steel Tool Set</h3>
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-[#ffb870] text-sm" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-on-surface">4.7</span>
                  <span className="font-label-sm text-on-surface-variant">(310 reviews)</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-headline-md text-primary">$59.00</span>
                  <div className="bg-secondary-container px-base py-xs rounded text-on-secondary-container font-label-sm">Heavy Duty</div>
                </div>
              </div>
            </div>

            {/* Product Card 4 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col reveal" style={{ transitionDelay: '300ms' }}>
              <div className="relative h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Lavender Nursery Starter" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyy8CoBx_Ly-2ZaTCy0vRdn4btP9hQoVs8O2gjZ3gzBaR-PrMbMABUQ9bz-D2VNatCAoLdSwW2kr1WfozjvtkpqDSUE2bNYj-MLhsuVtkeJdfVdMzJ4j26oumD-0ZV0KSHcu1UWUMXfnZYLBdpzmM0Fyp1J7rDlGeAeaqGB-L44lp4rfiX4MBwdXkes4j_-ITxjOgc8V9RiA7SPnVRK6BvWDxpCqJbnI549y0uomUQlj1x83w-YGdFplVRsr4uGivbkUaw6IaSrAQ" />
                <div className="absolute bottom-0 left-0 right-0 p-sm translate-y-full group-hover:translate-y-0 transition-transform bg-primary/20 backdrop-blur-sm">
                  <button className="w-full bg-primary text-white py-2 rounded-lg font-label-md flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart">add_shopping_cart</span>
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="p-md flex flex-col flex-grow">
                <div className="flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-tertiary-container text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label-sm text-on-surface-variant">Bloom Nursery</span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">English Lavender Nursery Starter</h3>
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-[#ffb870] text-sm" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-on-surface">5.0</span>
                  <span className="font-label-sm text-on-surface-variant">(45 reviews)</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-headline-md text-primary">$18.25</span>
                  <div className="bg-primary-fixed text-on-primary-fixed-variant px-base py-xs rounded font-label-sm">Eco-Pack</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Home Gardener Special */}
      <section className="py-xl px-margin-desktop relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-xl items-center">
            <div className="reveal">
              <span className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-full font-label-sm mb-md inline-block">Curated for You</span>
              <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary mb-md">Home Gardener Special</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
                We believe everyone can grow. Discover our exclusive range of small-quantity packs, DIY herb kits, and balcony-friendly tools designed specifically for the urban gardener.
              </p>
              <div className="grid md:grid-cols-2 gap-md">
                <div className="glass-card p-md rounded-xl flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary text-3xl" data-icon="inventory_2">inventory_2</span>
                  <div>
                    <h4 className="font-title-lg text-on-surface">Small-Quantity Packs</h4>
                    <p className="font-label-sm text-on-surface-variant">Perfect for balcony containers and small plots.</p>
                  </div>
                </div>
                <div className="glass-card p-md rounded-xl flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary text-3xl" data-icon="card_membership">card_membership</span>
                  <div>
                    <h4 className="font-title-lg text-on-surface">DIY Starter Kits</h4>
                    <p className="font-label-sm text-on-surface-variant">Everything you need for your first harvest.</p>
                  </div>
                </div>
              </div>
              <button className="mt-lg bg-primary text-white px-xl py-4 rounded-lg font-bold hover:scale-95 transition-transform flex items-center gap-sm">
                Explore Home Range
                <span className="material-symbols-outlined" data-icon="trending_flat">trending_flat</span>
              </button>
            </div>
            <div className="relative reveal" style={{ transitionDelay: '200ms' }}>
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                <img className="w-full h-full object-cover" alt="Home gardener" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHlETcK1ON_Q9mnY98IvvjSzwCasjrRDtTLpEN4mhiKIV7lhLR6gpSYJ4TWsJuEqQiCQ28G1N1ijfP5oq_Bch7onEI58RU2_xv748zSnf6Ypqs-nnK2bU22Q2bnYnVLE6CG6TUTdR8kMaX1SwWsWOHyCXo00auZnuvsYLEnaaCMn2BYHvMJuscJ5_4B3UALoNMtajC14YJkmJJq05WaVK4gYksr2fhfo7NdqIIKFhmKRwKmgVaEHtnKVnfbEUtQPrxKvvf80s_g3A" />
                <div className="absolute top-md left-md glass-card p-sm rounded-lg flex items-center gap-sm animate-float">
                  <div className="bg-primary-fixed p-xs rounded">
                    <span className="material-symbols-outlined text-primary" data-icon="spa" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                  </div>
                  <span className="font-label-sm font-bold text-primary">Organic Certification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-xl px-margin-desktop bg-surface-container-highest">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xl reveal">
            <h2 className="font-headline-lg text-headline-lg mb-sm">Why Choose ExVeg</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Building trust in every seed and tool we deliver.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center reveal">
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="verified_user">verified_user</span>
              </div>
              <h3 className="font-title-lg text-on-surface mb-sm">Verified Sellers</h3>
              <p className="font-body-md text-on-surface-variant">Every vendor undergoes a strict multi-point verification process for quality assurance.</p>
            </div>
            <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center reveal" style={{ transitionDelay: '100ms' }}>
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="lock">lock</span>
              </div>
              <h3 className="font-title-lg text-on-surface mb-sm">Secure Payments</h3>
              <p className="font-body-md text-on-surface-variant">Enterprise-grade encryption protecting every transaction you make on our platform.</p>
            </div>
            <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center reveal" style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="local_shipping">local_shipping</span>
              </div>
              <h3 className="font-title-lg text-on-surface mb-sm">Fast Delivery</h3>
              <p className="font-body-md text-on-surface-variant">Regional hub system ensures your agricultural supplies arrive fresh and on time.</p>
            </div>
            <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center reveal" style={{ transitionDelay: '300ms' }}>
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary text-3xl" data-icon="support_agent">support_agent</span>
              </div>
              <h3 className="font-title-lg text-on-surface mb-sm">Expert Support</h3>
              <p className="font-body-md text-on-surface-variant">Need advice on what to buy? Our agricultural experts are just a chat away.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
