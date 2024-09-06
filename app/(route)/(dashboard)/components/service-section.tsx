import Image from "next/image";

export interface ServiceSectionProps {}

const ServiceSection = ({}: ServiceSectionProps): React.ReactNode => {
  return (
    <section className="py-20 bg-zinc-50">
      <div className="max-w-[1140px] mx-auto">
        <h2 className="text-[40px] font-bold text-[#03B5C3]">
          Mr.Homes services
        </h2>
        <p className="mt-1 text-gray-400">
          Investigate housing trends, reflect them in residential spaces, and
          provide services to improve them.
        </p>
        <div className="grid grid-cols-4 gap-6 mt-8">
          {[
            {
              title: "Repair",
              desc: "Repair of broken parts such as wall, Floor, Plumbing, Electrical equipment. etc.",
              icon: "/assets/images/exclusive/repair.png",
            },
            {
              title: "Homestyling",
              desc: "Space production according to interior trend_Finishing materials, colors, lighting, props, etc.",
              icon: "/assets/images/exclusive/homestyling.png",
            },
            {
              title: "Purchase",
              desc: "Products are purchased instead to realize the space created by Homestyling.",
              icon: "/assets/images/exclusive/purchase.png",
            },
            {
              title: "Monitoring",
              desc: "Observe the economy market and collect opinions from clients to make the best quality.",
              icon: "/assets/images/exclusive/monitoring.png",
            },
          ].map((service, index) => (
            <div key={index} className="flex flex-col items-center mt-4">
              <Image
                src={service.icon}
                alt={service.title}
                width={500}
                height={500}
              />
              <h3 className="text-xl font-semibold text-[#03B5C3] mt-4 mb-6">
                {service.title}
              </h3>
              <p className="text-gray-500 mt-2">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
