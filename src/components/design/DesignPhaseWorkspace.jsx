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
  Diamond,
  X,
} from "lucide-react";

const DesignPhaseWorkspace = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialBounds, setInitialBounds] = useState(null);
  const [drawingElement, setDrawingElement] = useState(null);
  const [editingText, setEditingText] = useState(null);
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
    { id: "diamond", name: "Diamond", icon: Diamond, cursor: "crosshair" },
    { id: "arrow", name: "Arrow", icon: ArrowRight, cursor: "crosshair" },
    { id: "text", name: "Text", icon: Type, cursor: "text" },
  ];

  const documentTypes = [
    { id: "uml", name: "UML Diagram", icon: Layers, color: "purple" },
    { id: "wireframe", name: "Wireframe", icon: FileText, color: "blue" },
    { id: "mockup", name: "Mockup", icon: ImageIcon, color: "green" },
  ];

  const handleCanvasMouseDown = (e) => {
    const targetTag = e.target.tagName.toLowerCase();

    // Check if we clicked on a shape or handle (NOT the svg container itself)
    const clickedOnShape =
      targetTag === "rect" ||
      targetTag === "circle" ||
      targetTag === "ellipse" ||
      targetTag === "polygon" ||
      targetTag === "line" ||
      targetTag === "text" ||
      targetTag === "g";

    if (clickedOnShape) {
      return;
    }

    // Allow clicks on canvas DIV or SVG container (empty area)
    const isCanvasArea = e.target === canvasRef.current || targetTag === "svg";
    if (!isCanvasArea) {
      return;
    }

    // Deselect if clicking empty canvas with select tool
    if (selectedTool === "select") {
      setSelectedElement(null);
      setEditingText(null);
      return;
    }

    // Start drawing a new shape
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newElement = {
      id: crypto.randomUUID(),
      type: selectedTool,
      x,
      y,
      width: 1,
      height: 1,
      rotation: 0,
      fill: "#e0e7ff",
      stroke: "#6366f1",
      text: selectedTool === "text" ? "Double click to edit" : "",
    };

    setDrawingElement(newElement);
    setIsDrawing(true);
    setDragStart({ x, y });
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedTool !== "select") return;

    setSelectedElement(element);
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: (e.clientX - rect.left) / zoom - element.x,
      y: (e.clientY - rect.top) / zoom - element.y,
    });
  };

  const handleTextDoubleClick = (e, element) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedTool !== "select") return;
    setEditingText(element.id);
  };

  const handleTextChange = (elementId, newText) => {
    setElements(
      elements.map((el) =>
        el.id === elementId ? { ...el, text: newText } : el,
      ),
    );
  };

  const handleTextBlur = () => {
    setEditingText(null);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    if (isDrawing && drawingElement) {
      // Update drawing element size
      const width = Math.abs(mouseX - dragStart.x);
      const height = Math.abs(mouseY - dragStart.y);
      const x = Math.min(mouseX, dragStart.x);
      const y = Math.min(mouseY, dragStart.y);

      setDrawingElement({
        ...drawingElement,
        x,
        y,
        width: Math.max(width, 10),
        height: Math.max(height, 10),
      });
    } else if (isDragging && selectedElement) {
      // Move element
      const x = mouseX - dragStart.x;
      const y = mouseY - dragStart.y;
      setElements(
        elements.map((el) =>
          el.id === selectedElement.id ? { ...el, x, y } : el,
        ),
      );
    } else if (isResizing && selectedElement && resizeHandle) {
      // Resize element
      const dx = mouseX - dragStart.x;
      const dy = mouseY - dragStart.y;

      let newBounds = { ...initialBounds };

      if (resizeHandle.includes("e")) {
        newBounds.width = Math.max(20, initialBounds.width + dx);
      }
      if (resizeHandle.includes("w")) {
        const newWidth = Math.max(20, initialBounds.width - dx);
        newBounds.x = initialBounds.x + (initialBounds.width - newWidth);
        newBounds.width = newWidth;
      }
      if (resizeHandle.includes("s")) {
        newBounds.height = Math.max(20, initialBounds.height + dy);
      }
      if (resizeHandle.includes("n")) {
        const newHeight = Math.max(20, initialBounds.height - dy);
        newBounds.y = initialBounds.y + (initialBounds.height - newHeight);
        newBounds.height = newHeight;
      }

      const updatedElement = { ...selectedElement, ...newBounds };
      setSelectedElement(updatedElement);
      setElements(
        elements.map((el) =>
          el.id === selectedElement.id ? updatedElement : el,
        ),
      );
    } else if (isRotating && selectedElement) {
      // Rotate element
      const centerX = selectedElement.x + selectedElement.width / 2;
      const centerY = selectedElement.y + selectedElement.height / 2;
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
      const rotation = (angle * 180) / Math.PI + 90;

      const updatedElement = { ...selectedElement, rotation };
      setSelectedElement(updatedElement);
      setElements(
        elements.map((el) =>
          el.id === selectedElement.id ? updatedElement : el,
        ),
      );
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && drawingElement) {
      // Finalize the drawn shape
      if (drawingElement.width > 10 && drawingElement.height > 10) {
        setElements([...elements, drawingElement]);
        setSelectedElement(drawingElement);
      }
      setDrawingElement(null);
      setIsDrawing(false);
      setSelectedTool("select");
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
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

  const deleteDocument = (e, docId) => {
    e.stopPropagation();
    const updatedDocs = documents.filter((doc) => doc.id !== docId);
    setDocuments(updatedDocs);

    // If we deleted the current document, clear the canvas
    if (currentDocument?.id === docId) {
      setCurrentDocument(null);
      setElements([]);
    }
  };

  const handleResizeStart = (e, element, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(element);
    setIsResizing(true);
    setResizeHandle(handle);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    });
    setInitialBounds({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });
  };

  const handleRotateStart = (e, element) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(element);
    setIsRotating(true);
  };

  const renderResizeHandles = (element, rotation, centerX, centerY) => {
    const handleSize = 10;
    const handles = [
      { pos: "nw", x: element.x, y: element.y, cursor: "nw-resize" },
      {
        pos: "n",
        x: element.x + element.width / 2,
        y: element.y,
        cursor: "n-resize",
      },
      {
        pos: "ne",
        x: element.x + element.width,
        y: element.y,
        cursor: "ne-resize",
      },
      {
        pos: "e",
        x: element.x + element.width,
        y: element.y + element.height / 2,
        cursor: "e-resize",
      },
      {
        pos: "se",
        x: element.x + element.width,
        y: element.y + element.height,
        cursor: "se-resize",
      },
      {
        pos: "s",
        x: element.x + element.width / 2,
        y: element.y + element.height,
        cursor: "s-resize",
      },
      {
        pos: "sw",
        x: element.x,
        y: element.y + element.height,
        cursor: "sw-resize",
      },
      {
        pos: "w",
        x: element.x,
        y: element.y + element.height / 2,
        cursor: "w-resize",
      },
    ];

    return (
      <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
        {/* Selection bounding box */}
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="5,5"
          pointerEvents="none"
        />
        {handles.map((handle) => (
          <rect
            key={handle.pos}
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#f59e0b"
            strokeWidth={2}
            cursor={handle.cursor}
            style={{ pointerEvents: "all" }}
            onMouseDown={(e) => handleResizeStart(e, element, handle.pos)}
          />
        ))}
        {/* Rotation handle */}
        <g>
          <line
            x1={element.x + element.width / 2}
            y1={element.y}
            x2={element.x + element.width / 2}
            y2={element.y - 30}
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <circle
            cx={element.x + element.width / 2}
            cy={element.y - 30}
            r={8}
            fill="white"
            stroke="#f59e0b"
            strokeWidth={2}
            cursor="grab"
            style={{ pointerEvents: "all" }}
            onMouseDown={(e) => handleRotateStart(e, element)}
          />
        </g>
      </g>
    );
  };

  const renderElement = (element) => {
    const isSelected = selectedElement?.id === element.id;
    // Removed excessive logging - only log when selection changes
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const rotation = element.rotation || 0;

    const commonProps = {
      fill: element.fill,
      stroke: isSelected ? "#f59e0b" : element.stroke,
      strokeWidth: isSelected ? 3 : 2,
      cursor: selectedTool === "select" ? "move" : "default",
      onMouseDown: (e) => handleElementMouseDown(e, element),
    };

    let shapeElement;
    switch (element.type) {
      case "rectangle":
        shapeElement = (
          <rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            {...commonProps}
          />
        );
        break;
      case "circle":
        shapeElement = (
          <ellipse
            cx={element.x + element.width / 2}
            cy={element.y + element.height / 2}
            rx={element.width / 2}
            ry={element.height / 2}
            {...commonProps}
          />
        );
        break;
      case "triangle": {
        const points = `${element.x + element.width / 2},${element.y} ${element.x + element.width},${element.y + element.height} ${element.x},${element.y + element.height}`;
        shapeElement = <polygon points={points} {...commonProps} />;
        break;
      }
      case "diamond": {
        const points = `${element.x + element.width / 2},${element.y} ${element.x + element.width},${element.y + element.height / 2} ${element.x + element.width / 2},${element.y + element.height} ${element.x},${element.y + element.height / 2}`;
        shapeElement = <polygon points={points} {...commonProps} />;
        break;
      }
      case "arrow":
        shapeElement = (
          <>
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
          </>
        );
        break;
      case "text": {
        const isEditing = editingText === element.id;
        shapeElement = (
          <>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="transparent"
              stroke={isSelected ? "#f59e0b" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
              onDoubleClick={(e) => handleTextDoubleClick(e, element)}
            />
            {isEditing ? (
              <foreignObject
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
              >
                <input
                  type="text"
                  value={element.text}
                  onChange={(e) => handleTextChange(element.id, e.target.value)}
                  onBlur={handleTextBlur}
                  autoFocus
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "16px",
                    padding: "10px",
                    fontFamily: "inherit",
                  }}
                />
              </foreignObject>
            ) : (
              <text
                x={element.x + 10}
                y={element.y + 25}
                fontSize="16"
                fill="#1e293b"
                cursor={selectedTool === "select" ? "move" : "default"}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onDoubleClick={(e) => handleTextDoubleClick(e, element)}
              >
                {element.text}
              </text>
            )}
          </>
        );
        break;
      }
      default:
        shapeElement = null;
    }

    return (
      <g key={element.id}>
        <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
          {shapeElement}
        </g>
        {isSelected && renderResizeHandles(element, rotation, centerX, centerY)}
      </g>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't delete element if we're editing text
      if (editingText) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedElement) {
        setElements(elements.filter((el) => el.id !== selectedElement.id));
        setSelectedElement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, elements, editingText]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Sidebar - Tools */}
      <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-2 gap-1.5">
        {tools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
                selectedTool === tool.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title={tool.name}
            >
              <ToolIcon className="w-5 h-5" />
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Canvas Controls */}
        <div className="space-y-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              showGrid
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle Grid"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>

          {/* Zoom Controls */}
          <div className="text-center">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
              className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="text-[10px] font-semibold text-slate-600 py-0.5">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
              className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {selectedElement && (
          <button
            onClick={deleteSelectedElement}
            className="w-11 h-11 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center mt-1"
            title="Delete Selected"
          >
            <Trash2 className="w-5 h-5" />
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
              width: `${1600 * zoom}px`,
              height: `${1200 * zoom}px`,
              cursor: tools.find((t) => t.id === selectedTool)?.cursor,
              backgroundImage: showGrid
                ? `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`
                : "none",
              backgroundSize: showGrid
                ? `${20 * zoom}px ${20 * zoom}px`
                : "auto",
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              width={1600 * zoom}
              height={1200 * zoom}
              viewBox={`0 0 ${1600} ${1200}`}
              className="absolute inset-0"
              style={{ pointerEvents: "all" }}
            >
              {elements.map((element) => renderElement(element))}
              {drawingElement && renderElement(drawingElement)}
            </svg>

            {!currentDocument && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
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
                <div
                  key={doc.id}
                  className={`relative rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-100 border-2 border-purple-500"
                      : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                  }`}
                >
                  <button
                    onClick={() => loadDocument(doc)}
                    className="w-full text-left px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <DocIcon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isActive ? "text-purple-600" : "text-slate-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0 pr-6">
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
                  <button
                    onClick={(e) => deleteDocument(e, doc.id)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPhaseWorkspace;
