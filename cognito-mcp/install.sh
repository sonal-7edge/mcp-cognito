#!/bin/bash

echo "🚀 Cognito MCP Configuration Tool - Installation"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "⚠️  uv is not installed"
    echo "Installing uv..."
    
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
    else
        echo "Please install uv manually from: https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi
fi

echo "✅ uv found: $(uv --version)"

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install npm dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create output directory
mkdir -p output

# Check if .kiro directory exists
if [ ! -d "../.kiro" ]; then
    echo ""
    echo "⚠️  .kiro directory not found in parent directory"
    echo "Creating .kiro/settings directory..."
    mkdir -p ../.kiro/settings
fi

# Check if mcp.json exists
MCP_CONFIG="../.kiro/settings/mcp.json"

if [ -f "$MCP_CONFIG" ]; then
    echo ""
    echo "⚠️  mcp.json already exists"
    echo "Please manually add the following to your mcp.json:"
    echo ""
    echo '{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false
    },
    "cognito-config": {
      "command": "node",
      "args": ["cognito-mcp/server.js"],
      "disabled": false
    }
  }
}'
else
    echo ""
    echo "📝 Creating mcp.json configuration..."
    cat > "$MCP_CONFIG" << 'EOF'
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false
    },
    "cognito-config": {
      "command": "node",
      "args": ["cognito-mcp/server.js"],
      "disabled": false
    }
  }
}
EOF
    echo "✅ mcp.json created"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart Kiro or reconnect MCP servers"
echo "2. Open Kiro MCP Server view to verify connection"
echo "3. Start a conversation: 'I need to configure Cognito'"
echo ""
echo "For more information, see:"
echo "- README.md for full documentation"
echo "- QUICKSTART.md for quick start guide"
echo ""
