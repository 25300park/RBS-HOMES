import Image from "next/image";

export interface ServiceSectionProps {}

const ServiceSection = ({}: ServiceSectionProps): React.ReactNode => {
  return (
    <section className="pt-32">
      <div className="max-w-[1140px] mx-auto flex justify-between">
        <div className="relative">
          <h3 className="text-[#00092B] font-semibold text-xl mb-1">
            MR.HOMES SERVICES
          </h3>
          <p className="mt-1 text-gray-400">
            Investigate housing trends, reflect them in residential spaces, and
            provide services to improve them.
          </p>
          <div className="grid grid-cols-4 gap-3 mt-6 absolute w-[820px] z-10">
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
              <div
                key={index}
                className="flex flex-col items-center service-box py-8 px-4 rounded-lg bg-white"
              >
                <Image
                  src={service.icon}
                  alt={service.title}
                  width={500}
                  height={500}
                />
                <h3 className=" text-[#0C5782] mt-10 font-semibold">
                  {service.title}
                </h3>
                <p className="text-gray-500 mt-1 text-xs">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <Image
          src="/assets/images/sub-image.png"
          alt="sub"
          width={350}
          height={370}
        />
      </div>
    </section>
  );
};

export default ServiceSection;
