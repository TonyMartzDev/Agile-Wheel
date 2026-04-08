import { useState, useRef, useEffect } from "react";
import {
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Type,
  MousePointer2,
  Trash2,
  Download,
  Save,
  Plus,
  FileText,
  Layers,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Grid3x3,
} from "lucide-react";

const DesignPhaseWorkspace = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documents, setDocuments] = useState([
    { id: "1", name: "User Flow Diagram", type: "uml", elements: [] },
    { id: "2", name: "Home Page Wireframe", type: "wireframe", elements: [] },
  ]);

  const tools = [
    { id: "select", name: "Select", icon: MousePointer2, cursor: "default" },
    { id: "rectangle", name: "Rectangle", icon: Square, cursor: "crosshair" },
    { id: "circle", name: "Circle", icon: Circle, cursor: "crosshair" },
    { id: "triangle", name: "Triangle", icon: Triangle, cursor: "crosshair" },
    { id: "arrow", name: "Arrow", icon: ArrowRight, cursor: "crosshair" },
    { id: "text", name: "Text", icon: Type, cursor: "text" },
  ];

  const documentTypes = [
    { id: "uml", name: "UML Diagram", icon: Layers, color: "purple" },
    { id: "wireframe", name: "Wireframe", icon: FileText, color: "blue" },
    { id: "mockup", name: "Mockup", icon: ImageIcon, color: "green" },
  ];

  const handleCanvasClick = (e) => {
    if (selectedTool === "select") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newElement = {
      id: crypto.randomUUID(),
      type: selectedTool,
      x,
      y,
      width: selectedTool === "text" ? 200 : 100,
      height: selectedTool === "text" ? 40 : 100,
      fill: "#e0e7ff",
      stroke: "#6366f1",
      text: selectedTool === "text" ? "Double click to edit" : "",
    };

    setElements([...elements, newElement]);
    setSelectedTool("select");
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    if (selectedTool !== "select") return;

    setSelectedElement(element);
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: (e.clientX - rect.left) / zoom - element.x,
      y: (e.clientY - rect.top) / zoom - element.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragStart.x;
    const y = (e.clientY - rect.top) / zoom - dragStart.y;

    setElements(
      elements.map((el) =>
        el.id === selectedElement.id ? { ...el, x, y } : el,
      ),
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(elements.filter((el) => el.id !== selectedElement.id));
      setSelectedElement(null);
    }
  };

  const createNewDocument = (type) => {
    const newDoc = {
      id: crypto.randomUUID(),
      name: `New ${documentTypes.find((t) => t.id === type).name}`,
      type,
      elements: [],
      createdAt: new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
    setCurrentDocument(newDoc);
    setElements([]);
  };

  const saveCurrentDocument = () => {
    if (currentDocument) {
      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocument.id ? { ...doc, elements } : doc,
        ),
      );
    }
  };

  const loadDocument = (doc) => {
    setCurrentDocument(doc);
    setElements(doc.elements || []);
  };

  const renderElement = (element) => {
    const isSelected = selectedElement?.id === element.id;
    const commonProps = {
      fill: element.fill,
      stroke: isSelected ? "#f59e0b" : element.stroke,
      strokeWidth: isSelected ? 3 : 2,
      cursor: selectedTool === "select" ? "move" : "default",
      onMouseDown: (e) => handleElementMouseDown(e, element),
    };

    switch (element.type) {
      case "rectangle":
        return (
          <rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            {...commonProps}
          />
        );
      case "circle":
        return (
          <ellipse
            key={element.id}
            cx={element.x + element.width / 2}
            cy={element.y + element.height / 2}
            rx={element.width / 2}
            ry={element.height / 2}
            {...commonProps}
          />
        );
      case "triangle": {
        const points = `${element.x + element.width / 2},${element.y} ${element.x + element.width},${element.y + element.height} ${element.x},${element.y + element.height}`;
        return <polygon key={element.id} points={points} {...commonProps} />;
      }
      case "arrow":
        return (
          <g key={element.id}>
            <line
              x1={element.x}
              y1={element.y}
              x2={element.x + element.width}
              y2={element.y + element.height}
              {...commonProps}
              fill="none"
            />
            <polygon
              points={`${element.x + element.width},${element.y + element.height} ${element.x + element.width - 10},${element.y + element.height - 5} ${element.x + element.width - 10},${element.y + element.height + 5}`}
              {...commonProps}
            />
          </g>
        );
      case "text":
        return (
          <g key={element.id}>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="transparent"
              stroke={isSelected ? "#f59e0b" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
            />
            <text
              x={element.x + 10}
              y={element.y + 25}
              fontSize="16"
              fill="#1e293b"
              cursor={selectedTool === "select" ? "move" : "default"}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
            >
              {element.text}
            </text>
          </g>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElement) {
        setElements(elements.filter((el) => el.id !== selectedElement.id));
        setSelectedElement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, elements]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Sidebar - Tools */}
      <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Tools
        </h3>
        {tools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                selectedTool === tool.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title={tool.name}
            >
              <ToolIcon className="w-6 h-6" />
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Canvas Controls */}
        <div className="space-y-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
              showGrid
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle Grid"
          >
            <Grid3x3 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-6 h-6" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-6 h-6" />
          </button>
        </div>

        {selectedElement && (
          <button
            onClick={deleteSelectedElement}
            className="w-12 h-12 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
            title="Delete Selected"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {currentDocument?.name || "Design Workspace"}
            </h2>
            <p className="text-sm text-slate-500">
              {currentDocument
                ? documentTypes.find((t) => t.id === currentDocument.type)?.name
                : "Select or create a document to start designing"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveCurrentDocument}
              disabled={!currentDocument}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div
            ref={canvasRef}
            className="bg-white rounded-lg shadow-lg mx-auto relative"
            style={{
              width: `${800 * zoom}px`,
              height: `${600 * zoom}px`,
              cursor: tools.find((t) => t.id === selectedTool)?.cursor,
              backgroundImage: showGrid
                ? `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`
                : "none",
              backgroundSize: showGrid
                ? `${20 * zoom}px ${20 * zoom}px`
                : "auto",
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              width={800 * zoom}
              height={600 * zoom}
              viewBox={`0 0 ${800} ${600}`}
              className="absolute inset-0"
            >
              {elements.map((element) => renderElement(element))}
            </svg>

            {!currentDocument && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Document Selected
                  </h3>
                  <p className="text-slate-500">
                    Create or select a document from the right sidebar to start
                    designing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Documents */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Documents</h3>

          {/* Create New Document */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Create New:
            </p>
            {documentTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => createNewDocument(type.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-all hover:border-${type.color}-500 hover:bg-${type.color}-50`}
                >
                  <TypeIcon className={`w-5 h-5 text-${type.color}-600`} />
                  <span className="font-medium text-slate-700">
                    {type.name}
                  </span>
                  <Plus className="w-4 h-4 ml-auto text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Your Designs ({documents.length})
          </h4>
          <div className="space-y-2">
            {documents.map((doc) => {
              const docType = documentTypes.find((t) => t.id === doc.type);
              const DocIcon = docType?.icon;
              const isActive = currentDocument?.id === doc.id;

              return (
                <button
                  key={doc.id}
                  onClick={() => loadDocument(doc)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-100 border-2 border-purple-500"
                      : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <DocIcon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isActive ? "text-purple-600" : "text-slate-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm truncate ${
                          isActive ? "text-purple-900" : "text-slate-900"
                        }`}
                      >
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {docType?.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {doc.elements?.length || 0} elements
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPhaseWorkspace;
