export const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Stripe",
    location: "Remote",
    salary: "₹ 28–35 LPA",
    match: 94,
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Next.js"],
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Razorpay",
    location: "Bangalore",
    salary: "₹ 22–30 LPA",
    match: 88,
    posted: "1 day ago",
    tags: ["Node.js", "React", "PostgreSQL"],
  },
  {
    id: 3,
    title: "Software Engineer II",
    company: "Atlassian",
    location: "Hybrid · Pune",
    salary: "₹ 30–40 LPA",
    match: 81,
    posted: "3 days ago",
    tags: ["Java", "React", "Kafka"],
  },
  {
    id: 4,
    title: "React Developer",
    company: "Flipkart",
    location: "Bangalore",
    salary: "₹ 18–24 LPA",
    match: 76,
    posted: "5 days ago",
    tags: ["React", "Redux", "GraphQL"],
  },
];

export const mockApplications = [
  { id: 1, title: "Senior Frontend Engineer", company: "Stripe", status: "Interview", date: "May 28" },
  { id: 2, title: "Full Stack Developer", company: "Razorpay", status: "Applied", date: "May 30" },
  { id: 3, title: "Product Engineer", company: "CRED", status: "Rejected", date: "May 25" },
  { id: 4, title: "UI Engineer", company: "Swiggy", status: "Applied", date: "Jun 1" },
];

export const statusColors: Record<string, string> = {
  Applied: "bg-blue-500/20 text-blue-400",
  Interview: "bg-green-500/20 text-green-400",
  Rejected: "bg-red-500/20 text-red-400",
  Offer: "bg-purple-500/20 text-purple-400",
};
