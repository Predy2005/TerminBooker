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

// Default form structure
const defaultFormSteps = [
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
        width: "full"
      },
      {
        id: "customerEmail", 
        name: "E-mail",
        type: "email",
        required: true,
        placeholder: "vas@email.cz",
        width: "full"
      },
      {
        id: "customerPhone",
        name: "Telefon",
        type: "tel", 
        required: false,
        placeholder: "+420 xxx xxx xxx",
        width: "full"
      },
      {
        id: "note",
        name: "Poznámka",
        type: "textarea",
        required: false,
        placeholder: "Můžete zde uvést dodatečné informace...",
        width: "full"
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
        width: "full"
      }
    ]
  }
];

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
  const [currentPreset, setCurrentPreset] = useState("default");
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
    if (organization?.bookingFormLayout) {
      setSteps(organization.bookingFormLayout.steps || defaultFormSteps);
      setCurrentPreset(organization.activeLayoutPreset || "default");
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
      width: "full"
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
    setCurrentPreset("default");
    toast({
      title: "Obnoveno",
      description: "Layout byl obnoven na výchozí nastavení"
    });
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
          <FormPreview steps={steps} />
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
              onUpdateStep={(stepId, property, value) => {
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

function FormPreview({ steps }: { steps: FormStep[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle>{step.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {step.type === "service_selection" && (
              <div className="text-muted-foreground">
                [Náhled výběru služby]
              </div>
            )}
            
            {step.type === "datetime_selection" && (
              <div className="text-muted-foreground">
                [Náhled výběru data a času]
              </div>
            )}
            
            {step.type === "contact_form" && (
              <div className="grid gap-4">
                {step.fields.map((field) => (
                  <div key={field.id} className={`
                    ${field.width === "half" ? "col-span-6" : ""}
                    ${field.width === "third" ? "col-span-4" : ""}
                    ${field.width === "quarter" ? "col-span-3" : ""}
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}