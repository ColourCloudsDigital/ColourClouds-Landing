import InstallCode from "@/components/installcode";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <main className="">
      <section className="my-20 sm:my-60">
        <div className="max-w-7xl flex flex-col justify-center p-1 md:px-10 mx-auto sm:pt-10 lg:flex-row lg:justify-between items-center">
          <div className="flex flex-col justify-center p-6 text-center rounded-sm lg:max-w-md xl:max-w-lg lg:text-left leading-snug">
            <h1 className="text-6xl font-bold leadi sm:text-8xl leading-snug">
              Think <br />
              <span className="text-[#01A750] leading-snug"> Build </span><br />
              <span className="text-[#0072FF] leading-snug">
              Explore</span>
            </h1>
            <p className="mt-6 mb-8 text-lg sm:mb-12 leading-snug">
            Shaping Digital Experiences, One App at a Time
            </p>{" "}
            <div className="flex flex-col space-y-4 sm:items-center sm:justify-center sm:flex-row sm:space-y-0 sm:space-x-4 lg:justify-start">
              <Link href="/inators">
                <Button className="">Start Your Digital Journey</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center p-6 mt-8 lg:mt-0 h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128 ">
          <Image
            src="https://i.imghippo.com/files/tXnYf1727040648.png"
            alt="cc-hero-image"
            height={500}
            width={500}
            className="rounded-sm"
          />
          </div>
        </div>
      </section>

      {/* features section */}
      <section className="lg:p-8">
        <div className="md:container px-2 mx-auto space-y-20 lg:space-y-36">
          <div className="flex flex-col max-w-xl mx-auto overflow-hidden rounded-md lg:max-w-full lg:mx-0 lg:flex-row-reverse min-h-96">
            <div className="flex items-center justify-center flex-1 px-4 mb-8 lg:flex-3 h-72 lg:justify-end sm:h-80 lg:h-96 lg:mb-0">
              <Image
                src="https://images.unsplash.com/photo-1714859100446-ed641aeea95c?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="bg-image-1"
                height={500}
                width={500}
                className="rounded-sm"
              />
            </div>
            <div className="flex flex-col justify-center flex-1 px-6 lg:flex-2">
              <span className="mb-2 text-xs tracking-widest uppercase text-rose-600">
                {" "}
                Dare to Create{" "}
              </span>
              <h2 className="text-3xl font-bold">
              Innovative App Development & Digital Content Creation
              </h2>
              <p className="my-6 ">
                {" "}
                At Colour Clouds Digital, we&apos;re passionate about crafting digital solutions that resonate. Whether you&apos;re looking to build cutting-edge applications or engage your audience with compelling digital content, our team is ready to bring your vision to life. Explore how we transform ideas into impactful digital realities.{" "}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* features section */}

      {/* banner section */}
      <section className="py-6 bg-black text-gray-50 mt-14">
        <div className="container justify-center p-4 mx-auto space-y-8 md:p-10 lg:space-y-0 lg:space-x-12 lg:justify-around lg:flex lg:flex-row">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold leading-none">
              Follow us for more project updates
            </h2>
            <p className="px-4 text-lg lg:px-0">
              {" "}
              Let&#39;s Build Your Digital Future Together{" "}
            </p>
          </div>
          <div className="flex flex-row items-center self-center justify-center flex-shrink-0 lg:justify-end">
            <Link href="#">
              <Button
                variant="outline"
                size="lg"
                className="text-black dark:text-white"
              >
                Let&apos;s Talk
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* banner section */}

      {/* faq section */}
      <section className="mt-14 md:max-w-[70vw] mx-auto">
        <div className="container flex flex-col justify-center px-4 py-8 mx-auto md:p-8">
          <h2 className="text-2xl font-semibold sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 mb-8 ">
            Here are some of our FAQs. If you have any other questions
            you&apos;d like answered please feel free to contact me.
          </p>
          <div className="space-y-4">
            <details className="w-full border rounded-lg">
              <summary className="px-4 py-6 focus:outline-none focus-visible:ri">
              What services does Colour Clouds Digital offer?
              </summary>
              <p className="px-4 py-6 pt-0 ml-4 -mt-4 ">
              We specialize in app development and digital content creation, ranging from mobile solutions to interactive digital platforms.{" "}
              </p>
            </details>
            <details className="w-full border rounded-lg">
              <summary className="px-4 py-6 focus:outline-none focus-visible:ri">
              How can I get started with your services?
              </summary>
              <p className="px-4 py-6 pt-0 ml-4 -mt-4 ">
              Simply click on our Get Started Today button, and we&#39;ll walk you through the process of bringing your project to life.{" "}
              </p>
            </details>
            <details className="w-full border rounded-lg">
              <summary className="px-4 py-6 focus:outline-none focus-visible:ri">
              Do you offer custom solutions? 
              </summary>
              <p className="px-4 py-6 pt-0 ml-4 -mt-4 ">
              Yes! Every project is tailored to meet your unique needs and business goals. Let’s create something that stands out.{" "}
              </p>
            </details>
          </div>
        </div>
      </section>
      {/* faq section */}
    </main>
  );
}
