import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Quote = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-4">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Looking for the right tool?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our experts are here to help you find the perfect tool for your
            needs.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <Button asChild>
            <Link to="/contact">Request a Quote</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Quote;
