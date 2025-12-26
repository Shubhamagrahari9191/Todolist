import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePDF(tasks, username) {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header ---
        doc.setFillColor(15, 23, 42); // Dark background
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(`${username}'s Analytic Report`, 14, 15);

        // Motivational Quote
        const quotes = [
            "Keep pushing forward! 🚀",
            "Greatness is a journey. 🌟",
            "You are doing amazing things! 💪",
            "Believe in yourself! ✨"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        doc.setFontSize(12);
        doc.setTextColor(200, 200, 200);
        doc.text(quote, 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        const dateStr = new Date().toLocaleDateString();
        doc.text(`Generated: ${dateStr}`, pageWidth - 40, 25);

        // --- Table ---
        const tableColumn = ["Time Range", "Title", "Subject", "Date", "Progress"];
        const tableRows = [];

        const sortedTasks = [...tasks].sort((a, b) => {
            return new Date(a.date + ' ' + (a.startTime || '00:00')) - new Date(b.date + ' ' + (b.startTime || '00:00'));
        });

        sortedTasks.forEach(task => {
            const timeRange = `${task.startTime || '?'} - ${task.endTime || '?'}`;
            const taskData = [
                timeRange,
                task.title,
                task.subject || (task.isEvent ? 'EVENT' : '-'),
                task.date,
                `${task.progress || 0}%`
            ];
            tableRows.push(taskData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 3 },
        });

        let finalY = doc.lastAutoTable.finalY + 20;

        // --- Analytics Graphs drawing ---
        // If not enough space, add new page
        if (finalY > 200) {
            doc.addPage();
            finalY = 20;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Analytics Overview", 14, finalY);

        // Draw Productivity Line Chart (Simulated)
        // We will draw a simple line representing completion of tasks in list
        const chartY = finalY + 10;
        const chartHeight = 50;
        const chartWidth = 100;
        const chartX = 14;

        // Axis
        doc.setDrawColor(200, 200, 200);
        doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y
        doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X

        // Draw a mock trend line based on tasks provided (simple distribution)
        // Group tasks by index just to show a curve
        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(1);

        // Simple logic: Plot random points if not enough data, or use task count
        // Real implementation: Map date to x, count to y.
        // For this PDF, we will visualize the 'Progress' of top 5 tasks as a line
        let prevX = chartX;
        let prevY = chartY + chartHeight;

        const sampleData = sortedTasks.slice(0, 7).map(t => t.progress || 0);
        const stepX = chartWidth / (sampleData.length || 1);

        sampleData.forEach((val, i) => {
            const nextX = chartX + (i * stepX);
            const nextY = chartY + chartHeight - ((val / 100) * chartHeight);
            doc.line(prevX, prevY, nextX, nextY);
            prevX = nextX;
            prevY = nextY;
        });

        doc.setFontSize(10);
        doc.text("Task Progress Trend", chartX, chartY + chartHeight + 10);


        // Draw Subject Pie (Simplified as Color Bar for PDF)
        const pieX = 130;
        const pieY = chartY;
        doc.text("Subject Distribution", pieX, chartY + chartHeight + 10);

        const subjects = {};
        tasks.forEach(t => {
            const s = t.subject || 'Other';
            subjects[s] = (subjects[s] || 0) + 1;
        });
        const total = tasks.length || 1;

        let currentY = pieY;
        Object.entries(subjects).forEach(([sub, count]) => {
            const pct = Math.round((count / total) * 100);
            doc.text(`${sub}: ${pct}%`, pieX, currentY);
            // Draw bar
            doc.setFillColor(100, 100, 100);
            doc.rect(pieX + 40, currentY - 3, pct, 3, 'F');
            currentY += 10;
        });

        doc.save(`Pro_Report_${username.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Failed to generate PDF.");
    }
}
