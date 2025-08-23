import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  GripVertical, 
  Settings, 
  Eye, 
  Save, 
  RotateCcw,
  Plus,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

// Layout templates
const layoutTemplates = {
  vertical: {
    name: "Vertikální (výchozí)",
    description: "Kroky pod sebou - klasický layout",
    layout: "vertical",
    steps: [
      {
        id: "service",
        name: "Výběr služby",
        type: "service_selection",
        required: true,
        order: 1,
        fields: []
      },
      {
        id: "datetime", 
        name: "Datum a čas",
        type: "datetime_selection",
        required: true,
        order: 2,
        fields: []
      },
      {
        id: "contact",
        name: "Kontaktní údaje", 
        type: "contact_form",
        required: true,
        order: 3,
        fields: [
          {
            id: "customerName",
            name: "Jméno a příjmení",
            type: "text",
            required: true,
            placeholder: "Zadejte vaše jméno",
            width: "full" as const
          },
          {
            id: "customerEmail", 
            name: "E-mail",
            type: "email",
            required: true,
            placeholder: "vas@email.cz",
            width: "full" as const
          },
          {
            id: "customerPhone",
            name: "Telefon",
            type: "tel", 
            required: false,
            placeholder: "+420 xxx xxx xxx",
            width: "full" as const
          },
          {
            id: "note",
            name: "Poznámka",
            type: "textarea",
            required: false,
            placeholder: "Můžete zde uvést dodatečné informace...",
            width: "full" as const
          }
        ]
      },
      {
        id: "confirmation",
        name: "Potvrzení",
        type: "confirmation",
        required: true, 
        order: 4,
        fields: [
          {
            id: "terms",
            name: "Souhlasím se zpracováním osobních údajů",
            type: "checkbox",
            required: true,
            width: "full" as const
          }
        ]
      }
    ]
  },
  horizontal: {
    name: "Horizontální",
    description: "Kroky vedle sebe - rychlejší vyplnění",
    layout: "horizontal",
    steps: [
      {
        id: "service_datetime",
        name: "Služba a čas",
        type: "service_datetime_combined",
        required: true,
        order: 1,
        fields: []
      },
      {
        id: "contact",
        name: "Kontaktní údaje", 
        type: "contact_form",
        required: true,
        order: 2,
        fields: [
          {
            id: "customerName",
            name: "Jméno a příjmení",
            type: "text",
            required: true,
            placeholder: "Zadejte vaše jméno",
            width: "half" as const
          },
          {
            id: "customerEmail", 
            name: "E-mail",
            type: "email",
            required: true,
            placeholder: "vas@email.cz",
            width: "half" as const
          },
          {
            id: "customerPhone",
            name: "Telefon",
            type: "tel", 
            required: false,
            placeholder: "+420 xxx xxx xxx",
            width: "half" as const
          },
          {
            id: "note",
            name: "Poznámka",
            type: "textarea",
            required: false,
            placeholder: "Můžete zde uvést dodatečné informace...",
            width: "half" as const
          },
          {
            id: "terms",
            name: "Souhlasím se zpracováním osobních údajů",
            type: "checkbox",
            required: true,
            width: "full" as const
          }
        ]
      }
    ]
  },
  wizard: {
    name: "Průvodce (krokový)",
    description: "Jeden krok po druhém s pokračováním",
    layout: "wizard",
    steps: [
      {
        id: "service",
        name: "1. Výběr služby",
        type: "service_selection",
        required: true,
        order: 1,
        fields: []
      },
      {
        id: "datetime", 
        name: "2. Datum a čas",
        type: "datetime_selection",
        required: true,
        order: 2,
        fields: []
      },
      {
        id: "contact",
        name: "3. Vaše údaje", 
        type: "contact_form",
        required: true,
        order: 3,
        fields: [
          {
            id: "customerName",
            name: "Jméno a příjmení",
            type: "text",
            required: true,
            placeholder: "Zadejte vaše jméno",
            width: "full" as const
          },
          {
            id: "customerEmail", 
            name: "E-mail",
            type: "email",
            required: true,
            placeholder: "vas@email.cz",
            width: "full" as const
          },
          {
            id: "customerPhone",
            name: "Telefon",
            type: "tel", 
            required: false,
            placeholder: "+420 xxx xxx xxx",
            width: "full" as const
          },
          {
            id: "note",
            name: "Poznámka",
            type: "textarea",
            required: false,
            placeholder: "Můžete zde uvést dodatečné informace...",
            width: "full" as const
          }
        ]
      },
      {
        id: "confirmation",
        name: "4. Potvrzení",
        type: "confirmation",
        required: true, 
        order: 4,
        fields: [
          {
            id: "terms",
            name: "Souhlasím se zpracováním osobních údajů",
            type: "checkbox",
            required: true,
            width: "full" as const
          }
        ]
      }
    ]
  },
  minimal: {
    name: "Minimální",
    description: "Pouze nezbytné údaje - rychlá rezervace",
    layout: "minimal",
    steps: [
      {
        id: "service_datetime",
        name: "Služba a čas",
        type: "service_datetime_combined",
        required: true,
        order: 1,
        fields: []
      },
      {
        id: "contact",
        name: "Kontakt", 
        type: "contact_form",
        required: true,
        order: 2,
        fields: [
          {
            id: "customerName",
            name: "Jméno",
            type: "text",
            required: true,
            placeholder: "Vaše jméno",
            width: "half" as const
          },
          {
            id: "customerEmail", 
            name: "E-mail",
            type: "email",
            required: true,
            placeholder: "vas@email.cz",
            width: "half" as const
          },
          {
            id: "terms",
            name: "Souhlasím s podmínkami",
            type: "checkbox",
            required: true,
            width: "full" as const
          }
        ]
      }
    ]
  }
};

// Default form structure (vertical template)
const defaultFormSteps = layoutTemplates.vertical.steps;

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  placeholder?: string;
  width: "full" | "half" | "third" | "quarter";
  validation?: string;
  options?: string[];
}

interface FormStep {
  id: string;
  name: string;
  type: string;
  required: boolean;
  order: number;
  fields: FormField[];
}

export default function FormEditor() {
  const [steps, setSteps] = useState<FormStep[]>(defaultFormSteps);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreset, setCurrentPreset] = useState("vertical");
  const [currentLayout, setCurrentLayout] = useState("vertical");
  const [showTemplates, setShowTemplates] = useState(false);
  const { toast } = useToast();

  // Load organization form layout
  const { data: organization } = useQuery({
    queryKey: ["/api/organization"],
    queryFn: () => apiRequest("GET", "/api/organization")
  });

  const saveLayoutMutation = useMutation({
    mutationFn: (layoutData: any) => 
      apiRequest("PUT", "/api/organization/form-layout", layoutData),
    onSuccess: () => {
      toast({
        title: "Uloženo",
        description: "Layout formuláře byl úspěšně uložen"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organization"] });
    },
    onError: () => {
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit layout formuláře",
        variant: "destructive"
      });
    }
  });

  // Load saved layout on organization data load
  useEffect(() => {
    if (organization && (organization as any).bookingFormLayout) {
      setSteps((organization as any).bookingFormLayout.steps || defaultFormSteps);
      setCurrentPreset((organization as any).activeLayoutPreset || "vertical");
    }
  }, [organization]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setSteps(updatedItems);
  };

  const handleFieldDragEnd = (result: DropResult, stepId: string) => {
    if (!result.destination) return;

    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const step = { ...steps[stepIndex] };
    const fields = Array.from(step.fields);
    const [reorderedField] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, reorderedField);

    step.fields = fields;
    const newSteps = [...steps];
    newSteps[stepIndex] = step;
    setSteps(newSteps);
  };

  const updateFieldProperty = (stepId: string, fieldId: string, property: string, value: any) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: step.fields.map(field => {
            if (field.id === fieldId) {
              return { ...field, [property]: value };
            }
            return field;
          })
        };
      }
      return step;
    }));
  };

  const addCustomField = (stepId: string) => {
    const newField: FormField = {
      id: `custom_${Date.now()}`,
      name: "Nové pole",
      type: "text",
      required: false,
      placeholder: "",
      width: "full" as const
    };

    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: [...step.fields, newField]
        };
      }
      return step;
    }));
  };

  const removeField = (stepId: string, fieldId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: step.fields.filter(field => field.id !== fieldId)
        };
      }
      return step;
    }));
  };

  const saveLayout = () => {
    const layoutData = {
      steps,
      preset: currentPreset,
      lastModified: new Date().toISOString()
    };
    
    saveLayoutMutation.mutate(layoutData);
  };

  const resetToDefault = () => {
    setSteps(defaultFormSteps);
    setCurrentPreset("vertical");
    setCurrentLayout("vertical");
    toast({
      title: "Obnoveno",
      description: "Layout byl obnoven na výchozí nastavení"
    });
  };

  const applyTemplate = (templateKey: string) => {
    const template = layoutTemplates[templateKey as keyof typeof layoutTemplates];
    if (template) {
      setSteps(template.steps);
      setCurrentLayout(template.layout);
      setCurrentPreset(templateKey);
      setShowTemplates(false);
      toast({
        title: "Šablona použita",
        description: `Layout "${template.name}" byl úspěšně použit`
      });
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Náhled formuláře</h1>
              <Button onClick={() => setPreviewMode(false)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Zpět do editoru
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto p-6">
          <FormPreview steps={steps} layout={currentLayout} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/app/settings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zpět
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Editor rezervačního formuláře</h1>
                <p className="text-muted-foreground">Přizpůsobte si layout a pole formuláře</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowTemplates(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Šablony
              </Button>
              <Button onClick={() => setPreviewMode(true)} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Náhled
              </Button>
              <Button onClick={resetToDefault} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={saveLayout}
                disabled={saveLayoutMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveLayoutMutation.isPending ? "Ukládám..." : "Uložit"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Templates Modal */}
        {showTemplates && (
          <TemplatesModal
            onSelectTemplate={applyTemplate}
            onClose={() => setShowTemplates(false)}
            currentTemplate={currentPreset}
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Kroky formuláře</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Přetáhněte kroky pro změnu pořadí
                </p>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {steps.map((step, index) => (
                          <Draggable key={step.id} draggableId={step.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${
                                  snapshot.isDragging ? "shadow-lg" : ""
                                } ${
                                  selectedStep === step.id ? "ring-2 ring-primary" : ""
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                                      </div>
                                      <div>
                                        <h3 className="font-medium">{step.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                          {step.fields.length} polí
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {step.required && (
                                        <Badge variant="secondary">Povinný</Badge>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedStep(step.id)}
                                      >
                                        <Settings className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Fields in step */}
                                  {step.fields.length > 0 && (
                                    <div className="mt-4">
                                      <StepFieldsEditor 
                                        step={step}
                                        onFieldUpdate={updateFieldProperty}
                                        onFieldDragEnd={handleFieldDragEnd}
                                        onAddField={addCustomField}
                                        onRemoveField={removeField}
                                        selectedField={selectedField}
                                        onSelectField={setSelectedField}
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </div>

          {/* Properties Panel */}
          <div>
            <PropertiesPanel 
              selectedStep={selectedStep ? steps.find(s => s.id === selectedStep) : null}
              selectedField={selectedField}
              steps={steps}
              onUpdateStep={(stepId: string, property: string, value: any) => {
                setSteps(prev => prev.map(step => 
                  step.id === stepId ? { ...step, [property]: value } : step
                ));
              }}
              onUpdateField={updateFieldProperty}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Components for step fields editor, properties panel and form preview will be implemented next
function StepFieldsEditor({ step, onFieldUpdate, onFieldDragEnd, onAddField, onRemoveField, selectedField, onSelectField }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Pole</h4>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => onAddField(step.id)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <DragDropContext onDragEnd={(result) => onFieldDragEnd(result, step.id)}>
        <Droppable droppableId={`fields-${step.id}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {step.fields.map((field: any, index: number) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center justify-between p-2 rounded border ${
                        snapshot.isDragging ? "shadow-md" : ""
                      } ${
                        selectedField === field.id ? "bg-primary/10 border-primary" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm">{field.name}</span>
                        {field.required && (
                          <Badge variant="outline" className="text-xs">Povinné</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectField(field.id)}
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        {!["customerName", "customerEmail", "terms"].includes(field.id) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveField(step.id, field.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function PropertiesPanel({ selectedStep, selectedField, steps, onUpdateStep, onUpdateField }: any) {
  if (!selectedStep && !selectedField) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Vyberte krok nebo pole pro úpravu vlastností
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentField = selectedField ? 
    steps.flatMap((s: any) => s.fields).find((f: any) => f.id === selectedField) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedField ? "Vlastnosti pole" : "Vlastnosti kroku"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedField && currentField ? (
          // Field properties
          <div className="space-y-4">
            <div>
              <Label>Název pole</Label>
              <Input
                value={currentField.name}
                onChange={(e) => {
                  const stepId = steps.find((s: any) => 
                    s.fields.some((f: any) => f.id === selectedField)
                  )?.id;
                  if (stepId) onUpdateField(stepId, selectedField, "name", e.target.value);
                }}
              />
            </div>
            
            <div>
              <Label>Typ pole</Label>
              <Select
                value={currentField.type}
                onValueChange={(value) => {
                  const stepId = steps.find((s: any) => 
                    s.fields.some((f: any) => f.id === selectedField)
                  )?.id;
                  if (stepId) onUpdateField(stepId, selectedField, "type", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="tel">Telefon</SelectItem>
                  <SelectItem value="textarea">Víceřádkový text</SelectItem>
                  <SelectItem value="checkbox">Zaškrtávací pole</SelectItem>
                  <SelectItem value="select">Výběr ze seznamu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Placeholder</Label>
              <Input
                value={currentField.placeholder || ""}
                onChange={(e) => {
                  const stepId = steps.find((s: any) => 
                    s.fields.some((f: any) => f.id === selectedField)
                  )?.id;
                  if (stepId) onUpdateField(stepId, selectedField, "placeholder", e.target.value);
                }}
              />
            </div>
            
            <div>
              <Label>Šířka pole</Label>
              <Select
                value={currentField.width}
                onValueChange={(value) => {
                  const stepId = steps.find((s: any) => 
                    s.fields.some((f: any) => f.id === selectedField)
                  )?.id;
                  if (stepId) onUpdateField(stepId, selectedField, "width", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Celá šířka</SelectItem>
                  <SelectItem value="half">Polovina</SelectItem>
                  <SelectItem value="third">Třetina</SelectItem>
                  <SelectItem value="quarter">Čtvrtina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentField.required}
                onCheckedChange={(checked) => {
                  const stepId = steps.find((s: any) => 
                    s.fields.some((f: any) => f.id === selectedField)
                  )?.id;
                  if (stepId) onUpdateField(stepId, selectedField, "required", checked);
                }}
                disabled={["customerName", "customerEmail", "terms"].includes(currentField.id)}
              />
              <Label>Povinné pole</Label>
            </div>
          </div>
        ) : selectedStep ? (
          // Step properties
          <div className="space-y-4">
            <div>
              <Label>Název kroku</Label>
              <Input
                value={selectedStep.name}
                onChange={(e) => onUpdateStep(selectedStep.id, "name", e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={selectedStep.required}
                onCheckedChange={(checked) => onUpdateStep(selectedStep.id, "required", checked)}
                disabled={["service", "datetime", "contact", "confirmation"].includes(selectedStep.id)}
              />
              <Label>Povinný krok</Label>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TemplatesModal({ onSelectTemplate, onClose, currentTemplate }: {
  onSelectTemplate: (templateKey: string) => void;
  onClose: () => void;
  currentTemplate: string;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Vyberte šablonu layoutu</h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Vyberte z předpřipravených šablon pro rychlé nastavení formuláře
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(layoutTemplates).map(([key, template]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentTemplate === key ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onSelectTemplate(key)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    {currentTemplate === key && (
                      <Badge variant="default">Aktivní</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Kroky:</p>
                    <div className="space-y-1">
                      {template.steps.map((step, index) => (
                        <div key={step.id} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          {step.name}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        <strong>Layout:</strong> {template.layout === "vertical" ? "Vertikální" : 
                                                template.layout === "horizontal" ? "Horizontální" :
                                                template.layout === "wizard" ? "Průvodce" : "Minimální"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t bg-muted/30">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Zrušit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormPreview({ steps, layout = "vertical" }: { steps: FormStep[], layout?: string }) {
  // Pro wizard layout zobrazit jen první krok s navigací
  if (layout === "wizard") {
    const currentStep = steps[0] || steps[0];
    return (
      <div className="space-y-6">
        {/* Wizard progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current step */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStep.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Krok 1 z {steps.length}</p>
          </CardHeader>
          <CardContent>
            <StepPreviewContent step={currentStep} />
            <div className="flex justify-between mt-6">
              <Button variant="outline" disabled>Zpět</Button>
              <Button>Pokračovat</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pro horizontální layout zobrazit kroky vedle sebe
  if (layout === "horizontal") {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <Card key={step.id}>
            <CardHeader>
              <CardTitle className="text-lg">{step.name}</CardTitle>
              {step.required && (
                <Badge variant="secondary">Povinný</Badge>
              )}
            </CardHeader>
            <CardContent>
              <StepPreviewContent step={step} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Pro minimální layout zobrazit kompaktně
  if (layout === "minimal") {
    return (
      <div className="max-w-md mx-auto space-y-4">
        {steps.map((step) => (
          <Card key={step.id} className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3">{step.name}</h3>
              <StepPreviewContent step={step} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Výchozí vertikální layout
  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle>{step.name}</CardTitle>
            {step.required && (
              <Badge variant="secondary">Povinný krok</Badge>
            )}
          </CardHeader>
          <CardContent>
            <StepPreviewContent step={step} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Komponenta pro zobrazení obsahu kroku
function StepPreviewContent({ step }: { step: FormStep }) {
  return (
    <div>
      {step.type === "service_selection" && (
        <div className="text-muted-foreground">
          [Náhled výběru služby - zobrazí se seznam dostupných služeb]
        </div>
      )}
      
      {step.type === "datetime_selection" && (
        <div className="text-muted-foreground">
          [Náhled výběru data a času - kalendář a časové sloty]
        </div>
      )}
      
      {step.type === "service_datetime_combined" && (
        <div className="text-muted-foreground">
          [Náhled kombinovaného výběru služby a času]
        </div>
      )}
      
      {step.type === "contact_form" && (
        <div className="grid gap-4">
          {step.fields.map((field) => (
            <div key={field.id} className={`
              ${field.width === "half" ? "md:col-span-6" : ""}
              ${field.width === "third" ? "md:col-span-4" : ""}
              ${field.width === "quarter" ? "md:col-span-3" : ""}
            `}>
              <Label>{field.name} {field.required && "*"}</Label>
              {field.type === "textarea" ? (
                <Textarea placeholder={field.placeholder} disabled />
              ) : field.type === "checkbox" ? (
                <div className="flex items-center space-x-2">
                  <input type="checkbox" disabled />
                  <Label>{field.name}</Label>
                </div>
              ) : (
                <Input 
                  type={field.type} 
                  placeholder={field.placeholder} 
                  disabled 
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {step.type === "confirmation" && (
        <div className="space-y-4">
          {step.fields.map((field) => (
            <div key={field.id} className="flex items-center space-x-2">
              <input type="checkbox" disabled />
              <Label>{field.name}</Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}