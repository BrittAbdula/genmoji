import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";

export function Testimonials() {
  return (
    <Section
      title="Testimonials"
      subtitle="What our users say"
      className="container px-10"
    >
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 py-10">
        {siteConfig.testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-muted/60 overflow-hidden rounded-3xl flex flex-col h-fit"
            style={{
              gridRow: `span ${Math.floor(testimonial.text.length / 50) + 1}`,
            }}
          >
            <div className="px-4 py-5 sm:p-6 flex-grow">
              <div className="flex items-center mb-4">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-foreground">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-foreground">{testimonial.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
