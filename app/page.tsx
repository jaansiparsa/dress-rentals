import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10 max-w-6xl mx-auto px-8 py-16 sm:py-20">
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white">
                Student-to-Student Dress Rentals
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-primary-100 leading-relaxed">
                Connect with fellow students to find your perfect dress. Rent
                from peers, save money, and look amazing for any occasion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dresses"
                  className="btn-primary text-lg px-8 py-3 text-center bg-white text-primary-700 hover:bg-primary-50 hover:scale-105 transition-all rounded-xl"
                >
                  Find Your Perfect Dress
                </Link>
                <Link
                  href="/dresses/new"
                  className="btn-secondary text-lg px-8 py-3 text-center bg-primary-500 text-white hover:bg-primary-400 hover:scale-105 transition-all rounded-xl"
                >
                  List Your Dress
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-primary-100">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Trusted by 1000+ Students</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Verified Student Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Why Students Love Dress Rentals
          </h2>
          <p className="text-xl text-gray-600">
            Join the growing community of students who are making fashion more
            accessible, sustainable, and affordable.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-20 h-20 bg-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <svg
                className="w-10 h-10 text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-primary-900">
              Save Big
            </h3>
            <p className="text-primary-700 text-center">
              Rent designer dresses for 80% less than retail. Perfect for
              formals, interviews, and special events without breaking your
              budget.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-20 h-20 bg-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
              <svg
                className="w-10 h-10 text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-primary-900">
              Student Network
            </h3>
            <p className="text-primary-700 text-center">
              Connect with verified students on your campus. Easy pickup and
              drop-off locations, with a community you can trust.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-20 h-20 bg-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <svg
                className="w-10 h-10 text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-primary-900">
              Earn While You Learn
            </h3>
            <p className="text-primary-700 text-center">
              List your dresses and earn money when you're not wearing them.
              Turn your wardrobe into a source of income.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 text-primary-900">
              How Student Rentals Work
            </h2>
            <p className="text-xl text-primary-700">
              Simple, secure, and student-friendly. Join the community in just a
              few steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Browse Dresses",
                description:
                  "Find the perfect dress from fellow students on your campus",
              },
              {
                step: "2",
                title: "Check Availability",
                description: "See real-time availability and student reviews",
              },
              {
                step: "3",
                title: "Connect & Rent",
                description: "Message the owner and arrange pickup on campus",
              },
              {
                step: "4",
                title: "Wear & Return",
                description: "Enjoy your dress and return it to the owner",
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center h-full border-2 border-primary-100 hover:border-primary-300 transition-colors">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-primary-900">
                    {step.title}
                  </h3>
                  <p className="text-primary-700">{step.description}</p>
                </div>
                {step.step !== "4" && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-primary-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary-600 to-primary-700 p-12 rounded-3xl text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join the Student Dress Community?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Start browsing dresses from fellow students or list your own today.
            Join hundreds of students already using our platform to make fashion
            more accessible and affordable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dresses"
              className="btn-primary text-lg px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 hover:scale-105 transition-all"
            >
              Browse Student Dresses
            </Link>
            <Link
              href="/dresses/new"
              className="btn-secondary text-lg px-8 py-4 bg-primary-500 text-white hover:bg-primary-400 hover:scale-105 transition-all"
            >
              List Your Dress
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
