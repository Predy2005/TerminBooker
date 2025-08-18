import { Clock, Check } from "lucide-react";
import type { Service } from "@/types";

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

export default function ServiceSelector({ services, selectedService, onSelectService }: ServiceSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Vyberte službu</h2>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-lg border-2 transition-colors p-4 cursor-pointer ${
                selectedService?.id === service.id
                  ? "border-primary"
                  : "border-transparent hover:border-primary"
              }`}
              onClick={() => onSelectService(service)}
              data-testid={`service-${service.id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-slate-900" data-testid={`text-service-name-${service.id}`}>
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    <Clock className="inline mr-1 h-4 w-4" />
                    <span data-testid={`text-service-duration-${service.id}`}>
                      {service.durationMin}
                    </span> min
                  </p>
                </div>
                <div className="text-right">
                  {service.priceCzk && (
                    <>
                      <div className="text-lg font-semibold text-slate-900" data-testid={`text-service-price-${service.id}`}>
                        {service.priceCzk}
                      </div>
                      <div className="text-sm text-slate-500">Kč</div>
                    </>
                  )}
                </div>
              </div>
              {selectedService?.id === service.id && (
                <div className="mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full inline-block">
                  <Check className="inline mr-1 h-3 w-3" />
                  Vybráno
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
